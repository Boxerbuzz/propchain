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

    // Check if treasury already exists
    if (tokenization.multisig_treasury_address && tokenization.treasury_type === 'multisig') {
      return new Response(
        JSON.stringify({ 
          success: true,
          treasury_address: tokenization.multisig_treasury_address,
          message: 'Treasury already exists'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get owner's Hedera wallet
    const { data: ownerWallet } = await supabase
      .from('wallets')
      .select('hedera_account_id')
      .eq('user_id', tokenization.properties.owner_id)
      .single();

    if (!ownerWallet?.hedera_account_id) {
      return new Response(
        JSON.stringify({ error: 'Property owner must have a Hedera wallet. Please create one first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get platform admin from env
    const platformAdminAccountId = Deno.env.get('HEDERA_OPERATOR_ID') ?? '';
    if (!platformAdminAccountId) {
      throw new Error('HEDERA_OPERATOR_ID not configured');
    }

    // Define signers (Hedera account IDs) - owner + platform admin
    const hederaSigners = [
      ownerWallet.hedera_account_id, // Property owner
      platformAdminAccountId, // Platform admin (2-of-2 multisig)
    ];

    // Map to user IDs for database storage
    const userSigners = [
      tokenization.properties.owner_id, // Property owner user ID
      // TODO: Add platform admin user ID from a settings table
    ];

    const threshold = 2; // 2-of-2 multisig required

    console.log('🏦 Deploying UNIQUE MultiSig Treasury Contract...');
    console.log('Hedera Signers:', hederaSigners);
    console.log('User Signers:', userSigners);
    console.log('Threshold:', threshold);

    // ✅ REAL CONTRACT DEPLOYMENT
    const { MultiSigDeployer } = await import('../_shared/multiSigDeployer.ts');
    const deployer = new MultiSigDeployer();
    
    const deployment = await deployer.deployMultiSigTreasury({
      signers: hederaSigners,
      threshold,
      propertyOwner: ownerWallet.hedera_account_id
    });

    const treasuryAddress = deployment.contractAddress;
    const contractId = deployment.contractId;
    
    console.log('✅ NEW MultiSigTreasury deployed!');
    console.log('Contract Address:', treasuryAddress);
    console.log('Contract ID:', contractId);
    console.log('Transaction ID:', deployment.transactionId);

    // Update tokenization with REAL deployed contract details
    await supabase
      .from('tokenizations')
      .update({
        multisig_treasury_address: treasuryAddress,
        treasury_signers: userSigners,
        treasury_hedera_signers: hederaSigners,
        treasury_threshold: threshold,
        treasury_type: 'multisig',
        treasury_signers_count: hederaSigners.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenization_id);

    // Log REAL contract deployment
    await supabase.from('smart_contract_transactions').insert({
      contract_name: 'multisig_treasury',
      contract_address: treasuryAddress,
      function_name: 'constructor',
      transaction_hash: deployment.transactionId,
      transaction_status: 'confirmed',
      property_id: tokenization.property_id,
      tokenization_id,
      related_id: tokenization_id,
      related_type: 'tokenization',
      input_data: {
        hedera_signers: hederaSigners,
        user_signers: userSigners,
        threshold,
        tokenization_id,
        contract_id: contractId,
        signer_addresses: deployment.signerAddresses
      },
      confirmed_at: new Date().toISOString()
    });

    // Create activity log
    await supabase.from('activity_logs').insert({
      property_id: tokenization.property_id,
      tokenization_id,
      activity_type: 'treasury_created',
      description: `MultiSig treasury deployed: ${contractId} with ${hederaSigners.length} signers (${threshold}-of-${hederaSigners.length} required)`,
      metadata: {
        treasury_address: treasuryAddress,
        contract_id: contractId,
        signers_count: hederaSigners.length,
        threshold,
        transaction_id: deployment.transactionId,
        deployment_type: 'real_contract'
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
        contract_id: contractId,
        transaction_id: deployment.transactionId,
        hedera_signers: hederaSigners,
        user_signers: userSigners,
        threshold,
        deployment_type: 'real_contract',
        explorer_url: `https://hashscan.io/testnet/contract/${treasuryAddress}`
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
