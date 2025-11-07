import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  Client, 
  PrivateKey, 
  TransferTransaction, 
  Hbar,
  AccountId,
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
    const { investment_id, user_id, amount_ngn } = await req.json();

    if (!investment_id || !user_id || !amount_ngn) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[WALLET-PAYMENT] Processing payment for investment ${investment_id}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's primary wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_primary', true)
      .single();

    if (walletError || !wallet) {
      console.error('[WALLET-PAYMENT] Wallet not found:', walletError);
      return new Response(
        JSON.stringify({ success: false, error: 'Wallet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get wallet private key from Vault
    const { data: vaultData, error: vaultError } = await supabaseClient.rpc(
      'get_wallet_private_key',
      { p_wallet_id: wallet.id }
    );

    if (vaultError || !vaultData) {
      console.error('[WALLET-PAYMENT] Failed to retrieve private key:', vaultError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to access wallet credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch live exchange rates (HBAR/NGN)
    const hbarPriceUsd = await fetchHbarPrice();
    const usdToNgn = 1550; // You can fetch this from an API
    const hbarToNgn = hbarPriceUsd * usdToNgn;

    // Calculate HBAR amount needed using tinybars for precision
    const tinybarsRequired = Math.round((amount_ngn / hbarToNgn) * 1e8);
    const hbarAmount = tinybarsRequired / 1e8;
    
    console.log(`[WALLET-PAYMENT] Exchange rates - HBAR/USD: ${hbarPriceUsd}, USD/NGN: ${usdToNgn}, HBAR/NGN: ${hbarToNgn.toFixed(2)}`);
    console.log(`[WALLET-PAYMENT] Amount: ₦${amount_ngn} = ${hbarAmount.toFixed(8)} HBAR (${tinybarsRequired} tinybars)`);

    // Initialize Hedera client
    const hederaClient = Client.forTestnet();
    const operatorId = AccountId.fromString(Deno.env.get('HEDERA_OPERATOR_ID') ?? '');
    const operatorKey = PrivateKey.fromStringECDSA(Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY') ?? '');
    hederaClient.setOperator(operatorId, operatorKey);

    const userAccountId = AccountId.fromString(wallet.hedera_account_id);

    // Query live on-chain balance
    console.log(`[WALLET-PAYMENT] Querying on-chain balance for ${wallet.hedera_account_id}`);
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(userAccountId);
    const accountBalance = await balanceQuery.execute(hederaClient);
    const onChainTinybars = accountBalance.hbars.toTinybars().toNumber();
    const onChainHbar = onChainTinybars / 1e8;
    
    console.log(`[WALLET-PAYMENT] On-chain balance: ${onChainHbar.toFixed(8)} HBAR (${onChainTinybars} tinybars)`);

    // Check if user has sufficient HBAR balance (use on-chain balance)
    if (onChainTinybars < tinybarsRequired) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient HBAR balance',
          required_hbar: hbarAmount,
          required_tinybars: tinybarsRequired,
          available_hbar: onChainHbar,
          available_tinybars: onChainTinybars
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Platform treasury account (receives payments)
    const treasuryAccountId = AccountId.fromString(Deno.env.get('HEDERA_OPERATOR_ID') ?? '');

    // Execute HBAR transfer from user to treasury using precise tinybars
    const userPrivateKey = PrivateKey.fromStringECDSA(vaultData);

    console.log(`[WALLET-PAYMENT] Transferring ${hbarAmount.toFixed(8)} HBAR (${tinybarsRequired} tinybars) from ${userAccountId} to ${treasuryAccountId}`);

    const transferTx = await new TransferTransaction()
      .addHbarTransfer(userAccountId, Hbar.fromTinybars(-tinybarsRequired))
      .addHbarTransfer(treasuryAccountId, Hbar.fromTinybars(tinybarsRequired))
      .freezeWith(hederaClient);

    const signedTx = await transferTx.sign(userPrivateKey);
    const txResponse = await signedTx.execute(hederaClient);
    const receipt = await txResponse.getReceipt(hederaClient);

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }

    const transactionId = txResponse.transactionId.toString();
    console.log(`[WALLET-PAYMENT] Transfer Receipt:`, {
      status: receipt.status.toString(),
      transactionId: transactionId,
      hbarAmount: hbarAmount.toFixed(8),
      tinybars: tinybarsRequired,
      exchangeRate: hbarToNgn.toFixed(2),
      fromAccount: userAccountId.toString(),
      toAccount: treasuryAccountId.toString()
    });

    // Update investment record
    const { error: investmentError } = await supabaseClient
      .from('investments')
      .update({
        payment_status: 'confirmed',
        payment_confirmed_at: new Date().toISOString(),
        payment_method: 'wallet',
        crypto_amount_paid: hbarAmount,
        crypto_currency: 'HBAR',
        payment_tx_id: transactionId,
        exchange_rate: hbarToNgn
      })
      .eq('id', investment_id);

    if (investmentError) {
      console.error('[WALLET-PAYMENT] Failed to update investment:', investmentError);
      // Note: HBAR transfer already completed, log for manual reconciliation
      await supabaseClient
        .from('activity_logs')
        .insert({
          user_id: user_id,
          activity_type: 'payment_reconciliation_needed',
          description: `HBAR transfer succeeded but DB update failed for investment ${investment_id}`,
          metadata: {
            investment_id,
            transaction_id: transactionId,
            hbar_amount: hbarAmount,
            error: investmentError.message
          }
        });
    }

    // Trigger sync to update wallet balance
    await supabaseClient.functions.invoke('sync-wallet-balance', {
      body: { hederaAccountId: wallet.hedera_account_id }
    });

    // Call process-investment-completion
    await supabaseClient.functions.invoke('process-investment-completion', {
      body: { investment_id }
    });

    // Log activity
    await supabaseClient
      .from('activity_logs')
      .insert({
        user_id: user_id,
        activity_type: 'wallet_payment',
        description: `Payment processed via wallet: ${hbarAmount.toFixed(2)} HBAR (₦${amount_ngn.toLocaleString()})`,
        metadata: {
          investment_id,
          amount_ngn,
          hbar_amount: hbarAmount,
          transaction_id: transactionId,
          exchange_rate: hbarToNgn
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        transaction_id: transactionId,
        hbar_amount: hbarAmount,
        exchange_rate: hbarToNgn
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[WALLET-PAYMENT] Error:', error);
    
    // Log detailed error for reconciliation
    try {
      const body = await req.clone().json();
      const { investment_id, user_id, amount_ngn } = body;
      
      if (investment_id && user_id) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        // Get wallet info for context
        const { data: wallet } = await supabaseClient
          .from('wallets')
          .select('hedera_account_id')
          .eq('user_id', user_id)
          .eq('is_primary', true)
          .single();
        
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user_id,
            activity_type: 'wallet_payment_exception',
            description: `Wallet payment exception: ${error.message}`,
            metadata: {
              investment_id,
              amount_ngn,
              hedera_account_id: wallet?.hedera_account_id,
              error_message: error.message,
              error_stack: error.stack,
              timestamp: new Date().toISOString()
            }
          });
      }
    } catch (logError) {
      console.error('[WALLET-PAYMENT] Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        error_code: error.code || 'WALLET_PAYMENT_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchHbarPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd');
    const data = await response.json();
    return data['hedera-hashgraph']?.usd || 0.05; // Fallback price
  } catch (error) {
    console.error('Failed to fetch HBAR price, using fallback:', error);
    return 0.05;
  }
}
