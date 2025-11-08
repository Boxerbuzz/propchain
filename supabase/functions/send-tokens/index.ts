import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  Client, 
  PrivateKey, 
  AccountId, 
  TransferTransaction,
  AccountBalanceQuery,
  Hbar
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
    // Log authorization header for debugging
    const authHeader = req.headers.get('Authorization');
    console.log('[SEND-TOKENS] Auth header present:', !!authHeader);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error('[SEND-TOKENS] Auth error:', userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error('[SEND-TOKENS] No user found in session');
      throw new Error('User not authenticated. Please log in and try again.');
    }

    console.log('[SEND-TOKENS] Authenticated user:', user.id);

    const { recipient_address, token_type, amount } = await req.json();

    console.log(`[SEND-TOKENS] Request from user ${user.id}: Send ${amount} ${token_type} to ${recipient_address}`);

    // Validate inputs
    if (!recipient_address || !token_type || !amount) {
      throw new Error('Missing required fields: recipient_address, token_type, amount');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Validate recipient address format
    if (!recipient_address.match(/^0\.0\.\d+$/) && !recipient_address.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid recipient address format. Must be 0.0.xxxxx or 0x...');
    }

    // Get user's wallet
    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('hedera_account_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.hedera_account_id) {
      throw new Error('User wallet not found');
    }

    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('id, hedera_account_id, vault_secret_id')
      .eq('hedera_account_id', profile.hedera_account_id)
      .single();

    if (walletError || !wallet) {
      throw new Error('Wallet not found');
    }

    if (!wallet.vault_secret_id) {
      throw new Error('Wallet private key not found in vault');
    }

    // Get private key from vault
    const { data: vaultData, error: vaultError } = await supabaseClient.rpc(
      'get_wallet_private_key',
      { p_wallet_id: wallet.id }
    );

    if (vaultError || !vaultData) {
      console.error('[SEND-TOKENS] Vault error:', vaultError);
      throw new Error('Failed to retrieve wallet private key');
    }

    // Initialize Hedera client
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY');

    if (!operatorId || !operatorKey) {
      throw new Error('Hedera operator credentials not configured');
    }

    const client = Client.forTestnet();
    client.setOperator(operatorId, PrivateKey.fromStringECDSA(operatorKey));

    const senderAccountId = AccountId.fromString(wallet.hedera_account_id);
    const senderPrivateKey = PrivateKey.fromStringECDSA(vaultData);

    // Check balance before sending
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(senderAccountId);
    
    const accountBalance = await balanceQuery.execute(client);
    console.log(`[SEND-TOKENS] Current balance: ${accountBalance.hbars.toString()}`);

    // Create transfer transaction
    let transaction = new TransferTransaction();

    if (token_type === 'HBAR') {
      const hbarAmount = Hbar.from(amount, 'hbar');
      const requiredBalance = hbarAmount.toTinybars() + 100000000; // Add 1 HBAR for fees

      if (accountBalance.hbars.toTinybars() < requiredBalance) {
        throw new Error(`Insufficient HBAR balance. Required: ${Hbar.fromTinybars(requiredBalance).toString()}, Available: ${accountBalance.hbars.toString()}`);
      }

      transaction = transaction
        .addHbarTransfer(senderAccountId, hbarAmount.negated())
        .addHbarTransfer(recipient_address, hbarAmount);

      console.log(`[SEND-TOKENS] Sending ${hbarAmount.toString()} HBAR to ${recipient_address}`);
    } else if (token_type === 'USDC') {
      const usdcTokenId = Deno.env.get('HEDERA_USDC_TOKEN_ID') || '0.0.429274';
      const usdcAmount = Math.round(amount * 1_000_000); // USDC has 6 decimals

      const tokenBalance = accountBalance.tokens?.get(usdcTokenId);
      if (!tokenBalance || tokenBalance < usdcAmount) {
        throw new Error(`Insufficient USDC balance. Required: ${amount}, Available: ${tokenBalance ? tokenBalance / 1_000_000 : 0}`);
      }

      transaction = transaction
        .addTokenTransfer(usdcTokenId, senderAccountId, -usdcAmount)
        .addTokenTransfer(usdcTokenId, recipient_address, usdcAmount);

      console.log(`[SEND-TOKENS] Sending ${amount} USDC to ${recipient_address}`);
    } else {
      throw new Error('Unsupported token type. Use HBAR or USDC');
    }

    // Sign and execute
    transaction = transaction.freezeWith(client);
    const signedTx = await transaction.sign(senderPrivateKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log(`[SEND-TOKENS] Transaction successful: ${txResponse.transactionId.toString()}`);
    console.log(`[SEND-TOKENS] Receipt status: ${receipt.status.toString()}`);

    // Record transaction in activity logs
    await supabaseClient.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'token_transfer_sent',
      activity_category: 'wallet_transaction',
      description: `Sent ${amount} ${token_type} to ${recipient_address}`,
      metadata: {
        transaction_id: txResponse.transactionId.toString(),
        recipient: recipient_address,
        token_type: token_type,
        amount: amount,
        receipt_status: receipt.status.toString()
      }
    });

    // Sync wallet balance
    try {
      await supabaseClient.functions.invoke('sync-wallet-balance', {
        body: { hedera_account_id: wallet.hedera_account_id }
      });
    } catch (syncError) {
      console.error('[SEND-TOKENS] Balance sync failed:', syncError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: txResponse.transactionId.toString(),
        recipient: recipient_address,
        amount: amount,
        token_type: token_type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SEND-TOKENS] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
