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

    // Check if user already has a Hedera account
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

    // Create wallet record
    await supabaseClient
      .from('wallets')
      .insert({
        user_id: userId,
        wallet_type: 'hedera',
        hedera_account_id: accountResult.data.accountId,
        private_key_encrypted: accountResult.data.privateKey, // Should be encrypted in production
        is_primary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        notification_type: 'hedera_account_created',
        title: 'Blockchain Wallet Created',
        message: `Your Hedera account has been created successfully. Account ID: ${accountResult.data.accountId}`,
        action_url: '/wallet/dashboard',
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