import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  Client,
  AccountId,
  TokenId,
  AccountBalanceQuery
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[RECONCILE] Starting token distribution reconciliation');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY');

    if (!operatorId || !operatorKey) {
      throw new Error('Missing Hedera credentials');
    }

    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    // Get all active tokenizations with minted tokens
    const { data: tokenizations, error: tokenError } = await supabase
      .from('tokenizations')
      .select('id, token_id, token_symbol')
      .in('status', ['minted', 'active', 'distributed'])
      .not('token_id', 'is', null)
      .neq('token_id', 'pending');

    if (tokenError || !tokenizations || tokenizations.length === 0) {
      console.log('[RECONCILE] No tokenizations to reconcile');
      return new Response(
        JSON.stringify({ success: true, message: 'No tokenizations found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reconciliationResults = [];

    for (const tokenization of tokenizations) {
      console.log(`[RECONCILE] Processing tokenization: ${tokenization.token_symbol}`);

      const tokenIdObj = TokenId.fromString(tokenization.token_id);

      // Get all confirmed investments grouped by user
      const { data: investments, error: invError } = await supabase
        .from('investments')
        .select(`
          investor_id,
          tokens_requested,
          payment_status,
          investor:users!inner (
            hedera_account_id
          )
        `)
        .eq('tokenization_id', tokenization.id)
        .eq('payment_status', 'confirmed');

      if (invError || !investments || investments.length === 0) {
        console.log(`[RECONCILE] No confirmed investments for ${tokenization.token_symbol}`);
        continue;
      }

      // Aggregate by user
      const userAggregates = new Map<string, {
        user_id: string;
        hedera_account_id: string | null;
        total_tokens_expected: bigint;
      }>();

      for (const inv of investments) {
        const userId = inv.investor_id;
        const hederaAccount = inv.investor?.hedera_account_id;

        if (!hederaAccount) continue;

        if (!userAggregates.has(userId)) {
          userAggregates.set(userId, {
            user_id: userId,
            hedera_account_id: hederaAccount,
            total_tokens_expected: 0n
          });
        }

        const agg = userAggregates.get(userId)!;
        agg.total_tokens_expected += BigInt(inv.tokens_requested);
      }

      // Check on-chain balances for each user
      const usersNeedingDistribution = [];

      for (const [userId, agg] of userAggregates.entries()) {
        try {
          const userAccountId = AccountId.fromString(agg.hedera_account_id!);
          const balance = await new AccountBalanceQuery()
            .setAccountId(userAccountId)
            .execute(client);

          const tokenBalance = balance.tokens.get(tokenIdObj);
          const onChainBalance = tokenBalance ? BigInt(tokenBalance.toString()) : 0n;

          const delta = agg.total_tokens_expected - onChainBalance;

          if (delta > 0n) {
            console.log(`[RECONCILE] User ${userId} (${agg.hedera_account_id}) has shortfall: expected ${agg.total_tokens_expected}, has ${onChainBalance}, delta: ${delta}`);
            usersNeedingDistribution.push({
              user_id: userId,
              hedera_account_id: agg.hedera_account_id,
              expected: Number(agg.total_tokens_expected),
              actual: Number(onChainBalance),
              shortfall: Number(delta)
            });
          }
        } catch (error: any) {
          console.error(`[RECONCILE] Failed to query balance for ${agg.hedera_account_id}:`, error.message);
        }
      }

      if (usersNeedingDistribution.length > 0) {
        console.log(`[RECONCILE] Found ${usersNeedingDistribution.length} users with shortfalls for ${tokenization.token_symbol}`);
        
        // FIX 2.2: Check cooldown period before triggering distribution
        // Get tokenization to check last distribution time
        const { data: tokenizationData } = await supabase
          .from('tokenizations')
          .select('last_distribution_at')
          .eq('id', tokenization.id)
          .single();

        const COOLDOWN_MINUTES = 5; // 5 minute cooldown between distributions
        const now = new Date();
        const lastDistribution = tokenizationData?.last_distribution_at 
          ? new Date(tokenizationData.last_distribution_at)
          : null;

        if (lastDistribution) {
          const minutesSinceLastDistribution = 
            (now.getTime() - lastDistribution.getTime()) / (1000 * 60);
          
          if (minutesSinceLastDistribution < COOLDOWN_MINUTES) {
            const waitMinutes = Math.ceil(COOLDOWN_MINUTES - minutesSinceLastDistribution);
            console.log(
              `[RECONCILE] Skipping ${tokenization.token_symbol} - distribution ran ${minutesSinceLastDistribution.toFixed(1)} minutes ago. Cooldown: ${waitMinutes} minutes remaining`
            );
            
            reconciliationResults.push({
              tokenization_id: tokenization.id,
              token_symbol: tokenization.token_symbol,
              users_with_shortfall: usersNeedingDistribution.length,
              distribution_triggered: false,
              cooldown_remaining_minutes: waitMinutes,
              message: 'Skipped due to cooldown period'
            });
            continue;
          }
        }
        
        // Trigger distribution for these users
        const userIds = usersNeedingDistribution.map(u => u.user_id);
        
        // PHASE 3: Log reconciliation trigger
        console.log(`[RECONCILE] Logging reconciliation trigger for ${tokenization.token_symbol}`);
        for (const user of usersNeedingDistribution) {
          await supabase.from('activity_logs').insert({
            user_id: user.user_id,
            tokenization_id: tokenization.id,
            activity_type: 'reconciliation_triggered',
            activity_category: 'token_distribution',
            description: `Reconciliation triggered: ${user.shortfall} token shortfall detected`,
            metadata: {
              tokenization_id: tokenization.id,
              token_symbol: tokenization.token_symbol,
              expected_balance: user.expected,
              actual_balance: user.actual,
              shortfall: user.shortfall,
              hedera_account_id: user.hedera_account_id,
              triggered_by: 'reconcile_token_distributions',
              trigger_time: new Date().toISOString()
            }
          });
        }
        
        const { data, error } = await supabase.functions.invoke('distribute-tokens-to-kyc-users', {
          body: {
            tokenization_id: tokenization.id,
            target_user_ids: userIds
          }
        });

        if (error) {
          console.error(`[RECONCILE] Failed to trigger distribution for ${tokenization.token_symbol}:`, error);
          
          // PHASE 3: Log reconciliation failure
          for (const user of usersNeedingDistribution) {
            await supabase.from('activity_logs').insert({
              user_id: user.user_id,
              tokenization_id: tokenization.id,
              activity_type: 'reconciliation_failed',
              activity_category: 'token_distribution',
              description: `Reconciliation failed for ${tokenization.token_symbol}`,
              metadata: {
                tokenization_id: tokenization.id,
                token_symbol: tokenization.token_symbol,
                shortfall: user.shortfall,
                error: error.message || 'Unknown error',
                trigger_time: new Date().toISOString()
              }
            });
          }
        } else {
          console.log(`[RECONCILE] Distribution triggered successfully for ${tokenization.token_symbol}:`, data);
          
          // PHASE 3: Log reconciliation success
          for (const user of usersNeedingDistribution) {
            await supabase.from('activity_logs').insert({
              user_id: user.user_id,
              tokenization_id: tokenization.id,
              activity_type: 'reconciliation_completed',
              activity_category: 'token_distribution',
              description: `Reconciliation completed for ${tokenization.token_symbol}`,
              metadata: {
                tokenization_id: tokenization.id,
                token_symbol: tokenization.token_symbol,
                shortfall_resolved: user.shortfall,
                distribution_result: data,
                trigger_time: new Date().toISOString()
              }
            });
          }
        }

        reconciliationResults.push({
          tokenization_id: tokenization.id,
          token_symbol: tokenization.token_symbol,
          users_with_shortfall: usersNeedingDistribution.length,
          shortfalls: usersNeedingDistribution,
          distribution_triggered: !error
        });
      } else {
        console.log(`[RECONCILE] All users have correct balances for ${tokenization.token_symbol}`);
      }
    }

    console.log('[RECONCILE] Reconciliation complete');

    return new Response(
      JSON.stringify({
        success: true,
        reconciliations: reconciliationResults.length,
        results: reconciliationResults
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[RECONCILE] Fatal error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
