import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user already has a Hedera account (check both users table and wallets table)
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('hedera_account_id')
      .eq('id', userId)
      .single();

    if (existingUser?.hedera_account_id) {
      return new Response(JSON.stringify({ 
        success: true,
        data: { accountId: existingUser.hedera_account_id },
        message: 'User already has a Hedera account'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Double-check wallet table for more reliable check
    const { data: existingWallet } = await supabaseClient
      .from('wallets')
      .select('hedera_account_id')
      .eq('user_id', userId)
      .eq('wallet_type', 'hedera')
      .maybeSingle();

    if (existingWallet?.hedera_account_id) {
      return new Response(JSON.stringify({ 
        success: true,
        data: { accountId: existingWallet.hedera_account_id },
        message: 'User already has a Hedera account'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let hederaAccountId: string | null = null;

    // Call create-hedera-account edge function
    const accountResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-hedera-account`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
      },
    });

    const accountResult = await accountResponse.json();

    if (!accountResult.success) {
      console.error('Error creating Hedera account:', accountResult.error);
      return new Response(JSON.stringify({ error: 'Failed to create Hedera account' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Update user with Hedera account ID
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({
        hedera_account_id: accountResult.data.accountId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user with Hedera account:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update user profile' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Track account ID for cleanup if needed
    hederaAccountId = accountResult.data.accountId;

    // Store private key in Vault using database function wrapper
    console.log('Storing private key in Vault for account:', accountResult.data.accountId);
    const { data: vaultSecret, error: vaultError } = await supabaseClient
      .rpc('create_vault_secret', {
        p_secret: accountResult.data.privateKey,
        p_name: `hedera_private_key_${accountResult.data.accountId}`,
        p_description: `Hedera private key for account ${accountResult.data.accountId}`
      });

    if (vaultError) {
      console.error('Failed to store private key in Vault:', vaultError);
      // Log orphaned account for manual cleanup
      await supabaseClient.from('activity_logs').insert({
        user_id: userId,
        activity_type: 'wallet_creation_error',
        description: `Orphaned Hedera account created (Vault storage failed): ${hederaAccountId}`,
        metadata: { account_id: hederaAccountId, error: vaultError.message }
      });
      return new Response(JSON.stringify({ error: 'Failed to securely store wallet credentials' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Create wallet record with vault_secret_id
    await supabaseClient
      .from('wallets')
      .insert({
        user_id: userId,
        wallet_type: 'hedera',
        hedera_account_id: accountResult.data.accountId,
        vault_secret_id: vaultSecret,
        is_primary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    // Auto-associate USDC token with the new account
    console.log('Auto-associating USDC token for new account:', accountResult.data.accountId);
    try {
      const usdcResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/associate-usdc-token`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
      });

      const usdcResult = await usdcResponse.json();

      if (usdcResult.success) {
        console.log('USDC associated successfully');
        
        // Update wallet to mark USDC as associated
        await supabaseClient
          .from('wallets')
          .update({
            usdc_associated: true,
            usdc_associated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('hedera_account_id', accountResult.data.accountId);
      } else {
        console.error('USDC association failed (non-critical):', usdcResult.error);
      }
    } catch (usdcError) {
      console.error('USDC association error (non-critical):', usdcError);
      // Continue even if USDC association fails
    }

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        notification_type: 'hedera_account_created',
        title: 'Blockchain Wallet Created',
        message: `Your Hedera account has been created successfully. Account ID: ${accountResult.data.accountId}`,
        action_url: '/account/dashboard',
      });

    console.log(`Hedera account created for user ${userId}: ${accountResult.data.accountId}`);

    return new Response(JSON.stringify({ 
      success: true,
      data: { 
        accountId: accountResult.data.accountId,
        privateKey: accountResult.data.privateKey 
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in auto-create-hedera-account:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});