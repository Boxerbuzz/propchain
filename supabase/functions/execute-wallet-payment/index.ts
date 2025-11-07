import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  Client, 
  PrivateKey, 
  TransferTransaction, 
  Hbar,
  AccountId 
} from "https://esm.sh/@hashgraph/sdk@2.73.1";

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

    // Calculate HBAR amount needed
    const hbarAmount = amount_ngn / hbarToNgn;
    
    console.log(`[WALLET-PAYMENT] Amount: ₦${amount_ngn} = ${hbarAmount.toFixed(2)} HBAR`);

    // Check if user has sufficient HBAR balance
    if (wallet.balance_hbar < hbarAmount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient HBAR balance',
          required_hbar: hbarAmount,
          available_hbar: wallet.balance_hbar
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Hedera client
    const hederaClient = Client.forTestnet();
    const operatorId = AccountId.fromString(Deno.env.get('HEDERA_OPERATOR_ID') ?? '');
    const operatorKey = PrivateKey.fromStringECDSA(Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY') ?? '');
    hederaClient.setOperator(operatorId, operatorKey);

    // Platform treasury account (receives payments)
    const treasuryAccountId = AccountId.fromString(Deno.env.get('HEDERA_OPERATOR_ID') ?? '');

    // Execute HBAR transfer from user to treasury
    const userPrivateKey = PrivateKey.fromStringECDSA(vaultData);
    const userAccountId = AccountId.fromString(wallet.hedera_account_id);

    console.log(`[WALLET-PAYMENT] Transferring ${hbarAmount} HBAR from ${userAccountId} to ${treasuryAccountId}`);

    const transferTx = await new TransferTransaction()
      .addHbarTransfer(userAccountId, Hbar.from(-hbarAmount))
      .addHbarTransfer(treasuryAccountId, Hbar.from(hbarAmount))
      .freezeWith(hederaClient);

    const signedTx = await transferTx.sign(userPrivateKey);
    const txResponse = await signedTx.execute(hederaClient);
    const receipt = await txResponse.getReceipt(hederaClient);

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }

    const transactionId = txResponse.transactionId.toString();
    console.log(`[WALLET-PAYMENT] Transfer successful: ${transactionId}`);

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
    const { investment_id, user_id, amount_ngn } = await req.json().catch(() => ({}));
    
    if (investment_id && user_id) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseClient
        .from('activity_logs')
        .insert({
          user_id: user_id,
          activity_type: 'wallet_payment_exception',
          description: `Wallet payment exception: ${error.message}`,
          metadata: {
            investment_id,
            amount_ngn,
            error_message: error.message,
            error_stack: error.stack,
            timestamp: new Date().toISOString()
          }
        });
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
