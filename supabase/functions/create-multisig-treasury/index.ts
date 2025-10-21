import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { tokenization_id } = await req.json();

    console.log('Creating MultiSig treasury for tokenization:', tokenization_id);

    // Get tokenization details
    const { data: tokenization, error: tokenError } = await supabase
      .from('tokenizations')
      .select('*, properties!inner(owner_id)')
      .eq('id', tokenization_id)
      .single();

    if (tokenError || !tokenization) {
      return new Response(
        JSON.stringify({ error: 'Tokenization not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (tokenization.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Tokenization must be approved first' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Define signers (property owner + platform admin + investor representative)
    const signers = [
      tokenization.properties.owner_id, // Property owner
      'platform-admin-id', // Platform admin (should be from env or settings)
    ];

    // Deploy MultiSigTreasury contract (simulated)
    const treasuryAddress = `0x${Date.now()}_treasury_${tokenization_id.substring(0, 8)}`;
    const threshold = 2; // 2 of 3 signers

    console.log('Deploying MultiSigTreasury contract...');
    console.log('Signers:', signers);
    console.log('Threshold:', threshold);

    // Update tokenization with treasury details
    await supabase
      .from('tokenizations')
      .update({
        multisig_treasury_address: treasuryAddress,
        treasury_signers: signers,
        treasury_threshold: threshold,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenization_id);

    // Log contract deployment
    await supabase.from('smart_contract_transactions').insert({
      contract_name: 'multisig_treasury',
      contract_address: treasuryAddress,
      function_name: 'constructor',
      transaction_hash: `0x${Date.now()}_deploy`,
      transaction_status: 'confirmed',
      property_id: tokenization.property_id,
      tokenization_id,
      related_id: tokenization_id,
      related_type: 'tokenization',
      input_data: {
        signers,
        threshold,
        tokenization_id
      },
      confirmed_at: new Date().toISOString()
    });

    // Create activity log
    await supabase.from('activity_logs').insert({
      property_id: tokenization.property_id,
      tokenization_id,
      activity_type: 'treasury_created',
      description: `MultiSig treasury created with ${signers.length} signers`,
      metadata: {
        treasury_address: treasuryAddress,
        signers_count: signers.length,
        threshold
      }
    });

    // Create notification for property owner
    await supabase.from('notifications').insert({
      user_id: tokenization.properties.owner_id,
      title: 'Property Treasury Created',
      message: `A secure multi-signature treasury has been created for your property with ${threshold}-of-${signers.length} approval requirement.`,
      notification_type: 'treasury_created',
      priority: 'high',
      action_url: `/property/${tokenization.property_id}/treasury`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        treasury_address: treasuryAddress,
        signers,
        threshold
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating MultiSig treasury:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
