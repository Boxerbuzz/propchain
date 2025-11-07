// deno-lint-ignore-file
import { serve } from 'https://deno.land/std@0.178.0/http/server.ts'
import { Client, AccountBalanceQuery, TokenId } from "https://esm.sh/@hashgraph/sdk@2.73.2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

//2.73.2
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { hederaAccountId } = await req.json();

    if (!hederaAccountId) {
      return new Response(
        JSON.stringify({ error: 'Hedera account ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Hedera client
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorPrivateKey = Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY');

    if (!operatorId || !operatorPrivateKey) {
      console.error('Missing Hedera operator credentials');
      return new Response(
        JSON.stringify({ error: 'Missing Hedera configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Hedera client for testnet
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorPrivateKey);

    console.log(`Querying balance for account: ${hederaAccountId}`);

    // Query account balance
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(hederaAccountId);

    const balance = await balanceQuery.execute(client);
    const hbarBalance = balance.hbars.toTinybars();

    console.log(`Account ${hederaAccountId} balance: ${balance.hbars.toString()}`);

    const balanceHbar = Number(hbarBalance.toString()) / 100000000; // Convert tinybars to HBAR

    // Check for USDC token balance
    const usdcTokenIdStr = Deno.env.get('HEDERA_USDC_TOKEN_ID') || '0.0.429274'; // Testnet USDC
    console.log('Using USDC token ID:', usdcTokenIdStr);
    
    let usdcMicro = 0;
    let hasUsdc = false;
    let usdcBalance = 0;
    let usdcBalanceUsd = 0;
    let usdcBalanceNgn = 0;
    const tokensOut: Record<string, number> = {};

    // Fetch detailed token information from mirror node
    const mirrorNodeUrl = Deno.env.get('HEDERA_MIRROR_NODE_URL') || 'https://testnet.mirrornode.hedera.com';
    const associatedTokens: Array<{
      tokenId: string;
      tokenName: string;
      tokenSymbol: string;
      balance: number;
      decimals: number;
    }> = [];

    // Iterate through token map and build serializable tokens object
    if (balance.tokens) {
      for (const [tid, amountLong] of balance.tokens as unknown as Iterable<[any, any]>) {
        const idStr = tid.toString();
        const amountMicro = Number(amountLong.toString()); // Convert Long to number
        tokensOut[idStr] = amountMicro; // Store raw units

        if (idStr === usdcTokenIdStr) {
          hasUsdc = true;
          usdcMicro = amountMicro;
        }

        // Fetch token metadata from mirror node
        try {
          const tokenInfoResponse = await fetch(
            `${mirrorNodeUrl}/api/v1/tokens/${idStr}`
          );
          if (tokenInfoResponse.ok) {
            const tokenData = await tokenInfoResponse.json();
            associatedTokens.push({
              tokenId: idStr,
              tokenName: tokenData.name || idStr,
              tokenSymbol: tokenData.symbol || idStr,
              balance: amountMicro,
              decimals: tokenData.decimals || 0,
            });
          }
        } catch (e) {
          console.warn(`Failed to fetch metadata for token ${idStr}:`, e);
          // Still add token with minimal info
          associatedTokens.push({
            tokenId: idStr,
            tokenName: idStr,
            tokenSymbol: idStr,
            balance: amountMicro,
            decimals: 0,
          });
        }
      }
    }

    // USDC has 6 decimals
    usdcBalance = usdcMicro / 1_000_000;
    
    console.log('Detected tokens:', tokensOut);
    console.log(`USDC associated: ${hasUsdc}, USDC balance: ${usdcBalance}`);

    // Fetch real exchange rates
    let balanceUsd = 0;
    let balanceNgn = 0;

    try {
      // Get HBAR/USD rate from CoinGecko
      const hbarResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd');
      const hbarData = await hbarResponse.json();
      const hbarToUsd = hbarData['hedera-hashgraph']?.usd || 0.05; // Fallback to mock rate

      // Get USD/NGN rate
      const usdResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn');
      const usdData = await usdResponse.json();
      const usdToNgn = usdData.tether?.ngn || 1500; // Fallback to mock rate

      balanceUsd = balanceHbar * hbarToUsd;
      balanceNgn = balanceUsd * usdToNgn;

      // Calculate USDC fiat values (USDC = USD 1:1)
      usdcBalanceUsd = usdcBalance;
      usdcBalanceNgn = usdcBalance * usdToNgn;

      console.log(`Exchange rates - HBAR/USD: ${hbarToUsd}, USD/NGN: ${usdToNgn}`);
    } catch (error) {
      console.error('Failed to fetch exchange rates, using fallbacks:', error);
      // Use fallback rates if API fails
      balanceUsd = balanceHbar * 0.05;
      balanceNgn = balanceUsd * 1500;
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update wallet balance in database
    try {
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance_hbar: balanceHbar,
          balance_usd: balanceUsd,
          balance_ngn: balanceNgn,
          balance_usdc: usdcBalance,
          usdc_associated: hasUsdc,
          associated_tokens: associatedTokens,
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('hedera_account_id', hederaAccountId);

      if (updateError) {
        console.error('Failed to update wallet balance in database:', updateError);
        // Continue execution - don't fail the entire request if DB update fails
      } else {
        console.log(`Wallet balance updated in database for account: ${hederaAccountId}`);
      }
    } catch (dbError) {
      console.error('Database update error:', dbError);
      // Continue execution - don't fail the entire request if DB update fails
    }

    const result = {
      hederaAccountId,
      balanceHbar: balanceHbar,
      balanceUsd: balanceUsd,
      balanceNgn: balanceNgn,
      usdcBalance: usdcBalance,
      usdcBalanceUsd: usdcBalanceUsd,
      usdcBalanceNgn: usdcBalanceNgn,
      usdcAssociated: hasUsdc,
      exchangeRates: {
        hbarToUsd: balanceUsd / (balanceHbar || 1),
        usdToNgn: balanceNgn / (balanceUsd || 1),
      },
      lastSyncAt: new Date().toISOString(),
      tokens: tokensOut,
      associatedTokens: associatedTokens,
    };

    console.log('Balance sync completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error syncing wallet balance:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync wallet balance',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});