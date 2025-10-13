import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client, PrivateKey, AccountId, TokenAssociateTransaction, TokenId } from "https://esm.sh/@hashgraph/sdk@2.73.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HEDERA_OPERATOR_ID = Deno.env.get("HEDERA_OPERATOR_ID");
const HEDERA_OPERATOR_PRIVATE_KEY = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY");
const USDC_TOKEN_ID = "0.0.429274"; // Hedera Testnet USDC

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's wallet with Hedera account and wallet type
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, hedera_account_id, wallet_type, vault_secret_id')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet?.hedera_account_id) {
      console.error('Wallet lookup error:', walletError);
      return new Response(JSON.stringify({ 
        error: 'No Hedera wallet found. Please create a wallet first.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Wallet found:', { 
      accountId: wallet.hedera_account_id, 
      walletType: wallet.wallet_type,
      hasVaultSecret: !!wallet.vault_secret_id 
    });

    // Check if already associated
    const { data: userData } = await supabase
      .from('users')
      .select('usdc_associated')
      .eq('id', user.id)
      .single();

    if (userData?.usdc_associated) {
      console.log('USDC already associated for account:', wallet.hedera_account_id);
      return new Response(JSON.stringify({ 
        success: true,
        already_associated: true,
        message: 'USDC is already associated with your account'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Check if wallet is external or custodial
    if (wallet.wallet_type !== 'hedera' || !wallet.vault_secret_id) {
      console.log('External wallet detected, cannot associate server-side:', wallet.wallet_type);
      return new Response(JSON.stringify({ 
        error: 'external_wallet',
        message: 'This is an external wallet. Please associate USDC from your wallet app (HashPack, Blade, etc.).'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Hedera client
    console.log('Initializing Hedera client for custodial wallet association');
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(HEDERA_OPERATOR_ID!),
      PrivateKey.fromStringECDSA(HEDERA_OPERATOR_PRIVATE_KEY!)
    );

    // Create token association transaction
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(wallet.hedera_account_id))
      .setTokenIds([TokenId.fromString(USDC_TOKEN_ID)])
      .setTransactionMemo('USDC Token Association');

    // Freeze with client
    const frozenTx = await associateTx.freezeWith(client);

    // Get user's private key from Vault
    console.log('Retrieving private key from Vault');
    const { data: privateKeyData, error: vaultError } = await supabase
      .rpc('get_wallet_private_key', { p_wallet_id: wallet.id });

    if (vaultError || !privateKeyData) {
      console.error('Failed to retrieve private key from Vault:', vaultError);
      return new Response(JSON.stringify({ 
        error: 'vault_error',
        message: 'Failed to retrieve wallet credentials. Please contact support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sign with user's private key first
    console.log('Signing transaction with user private key');
    const userPrivateKey = PrivateKey.fromStringDer(privateKeyData);
    const userSignedTx = await frozenTx.sign(userPrivateKey);

    // Then sign with operator key
    console.log('Signing transaction with operator key');
    const operatorSignedTx = await userSignedTx.sign(PrivateKey.fromStringECDSA(HEDERA_OPERATOR_PRIVATE_KEY!));

    // Execute transaction
    console.log('Executing token association transaction');
    const txResponse = await operatorSignedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log('Transaction receipt status:', receipt.status.toString());

    if (receipt.status.toString() !== 'SUCCESS') {
      const statusCode = receipt.status._code;
      let errorMessage = 'Token association failed';
      
      // Map common status codes to user-friendly messages
      if (statusCode === 7) {
        errorMessage = 'Invalid signature. Please contact support.';
      } else if (statusCode === 167) {
        errorMessage = 'USDC is already associated with this account.';
      } else if (statusCode === 168) {
        errorMessage = 'Token not found. Please contact support.';
      }
      
      console.error('Association failed:', { status: receipt.status.toString(), code: statusCode });
      
      return new Response(JSON.stringify({ 
        error: 'association_failed',
        message: errorMessage,
        code: statusCode
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transactionId = txResponse.transactionId.toString();

    // Update user record
    console.log('Updating user record with usdc_associated = true');
    await supabase
      .from('users')
      .update({ 
        usdc_associated: true
      })
      .eq('id', user.id);

    // Update wallet record
    console.log('Updating wallet record with transaction ID');
    await supabase
      .from('wallets')
      .update({
        usdc_associated: true,
        usdc_token_association_tx: transactionId
      })
      .eq('hedera_account_id', wallet.hedera_account_id);

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'USDC Token Associated',
      message: 'Your Hedera account is now associated with USDC. You can now receive USDC payments and dividends.',
      notification_type: 'usdc_associated',
      priority: 'normal',
      action_url: '/wallet/settings',
    });

    console.log('USDC associated successfully:', wallet.hedera_account_id);

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transactionId,
      message: 'USDC token associated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error associating USDC:', error);
    
    // Extract user-friendly error message
    let message = 'Failed to associate USDC. Please try again.';
    
    if (error.message?.includes('INVALID_SIGNATURE')) {
      message = 'Transaction signature failed. Please contact support.';
    } else if (error.message?.includes('TOKEN_ALREADY_ASSOCIATED')) {
      message = 'USDC is already associated with your account.';
    } else if (error.message?.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
      message = 'Insufficient HBAR balance to pay for transaction fee.';
    } else if (error.message) {
      message = error.message;
    }
    
    return new Response(JSON.stringify({ 
      error: 'association_error',
      message: message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
