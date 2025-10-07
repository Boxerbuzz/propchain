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

    // Check if user has Hedera account
    if (!user.hedera_account_id) {
      return new Response(JSON.stringify({ error: 'No Hedera account found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already associated
    const { data: userData } = await supabase
      .from('users')
      .select('usdc_associated')
      .eq('id', user.id)
      .single();

    if (userData?.usdc_associated) {
      return new Response(JSON.stringify({ 
        success: true,
        already_associated: true,
        message: 'USDC already associated with your account'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(HEDERA_OPERATOR_ID!),
      PrivateKey.fromStringECDSA(HEDERA_OPERATOR_PRIVATE_KEY!)
    );

    // Create token association transaction
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(user.hedera_account_id))
      .setTokenIds([TokenId.fromString(USDC_TOKEN_ID)])
      .setTransactionMemo('USDC Token Association')
      .freezeWith(client);

    const signedTx = await associateTx.sign(PrivateKey.fromStringECDSA(HEDERA_OPERATOR_PRIVATE_KEY!));
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error('Token association failed');
    }

    const transactionId = txResponse.transactionId.toString();

    // Update user record
    await supabase
      .from('users')
      .update({ 
        usdc_associated: true
      })
      .eq('id', user.id);

    // Update wallet record
    await supabase
      .from('wallets')
      .update({
        usdc_token_association_tx: transactionId
      })
      .eq('hedera_account_id', user.hedera_account_id);

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'USDC Token Associated',
      message: 'Your Hedera account is now associated with USDC. You can now receive USDC payments and dividends.',
      notification_type: 'usdc_associated',
      priority: 'normal',
      action_url: '/wallet/settings',
    });

    console.log('USDC associated successfully:', user.hedera_account_id);

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
