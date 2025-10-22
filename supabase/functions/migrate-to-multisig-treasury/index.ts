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

    console.log('🔄 Starting MultiSig Treasury Migration...');

    // Get all active tokenizations without multisig treasury
    const { data: tokenizations, error: fetchError } = await supabase
      .from('tokenizations')
      .select(`
        id,
        created_by,
        property_id,
        multisig_treasury_address,
        properties!inner(owner_id)
      `)
      .is('multisig_treasury_address', null)
      .eq('status', 'active');

    if (fetchError) throw fetchError;

    if (!tokenizations || tokenizations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No tokenizations to migrate',
          migrated_count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tokenizations.length} tokenizations to migrate`);

    const { MultiSigDeployer } = await import('../_shared/multiSigDeployer.ts');
    const deployer = new MultiSigDeployer();

    const results = [];
    const platformAdminAccountId = Deno.env.get('HEDERA_OPERATOR_ID') ?? '';

    for (const token of tokenizations) {
      try {
        console.log(`\n📦 Migrating tokenization ${token.id}...`);

        // Get owner's Hedera wallet
        const { data: ownerWallet } = await supabase
          .from('wallets')
          .select('hedera_account_id')
          .eq('user_id', token.properties.owner_id)
          .single();

        if (!ownerWallet?.hedera_account_id) {
          console.log(`⚠️  Skipping ${token.id}: Owner has no Hedera wallet`);
          results.push({
            tokenization_id: token.id,
            success: false,
            error: 'Owner has no Hedera wallet'
          });
          continue;
        }

        // Define signers
        const hederaSigners = [
          ownerWallet.hedera_account_id,
          platformAdminAccountId
        ];

        const userSigners = [
          token.properties.owner_id
          // TODO: Add platform admin user ID
        ];

        const threshold = 2;

        // Deploy contract
        console.log(`🚀 Deploying MultiSigTreasury for tokenization ${token.id}...`);
        const deployment = await deployer.deployMultiSigTreasury({
          signers: hederaSigners,
          threshold,
          propertyOwner: ownerWallet.hedera_account_id
        });

        // Update tokenization
        await supabase
          .from('tokenizations')
          .update({
            multisig_treasury_address: deployment.contractAddress,
            treasury_signers: userSigners,
            treasury_hedera_signers: hederaSigners,
            treasury_threshold: threshold,
            treasury_type: 'multisig',
            treasury_signers_count: hederaSigners.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', token.id);

        // Log contract transaction
        await supabase.from('smart_contract_transactions').insert({
          contract_name: 'multisig_treasury',
          contract_address: deployment.contractAddress,
          function_name: 'constructor',
          transaction_hash: deployment.transactionId,
          transaction_status: 'confirmed',
          property_id: token.property_id,
          tokenization_id: token.id,
          related_id: token.id,
          related_type: 'tokenization',
          input_data: {
            hedera_signers: hederaSigners,
            user_signers: userSigners,
            threshold,
            contract_id: deployment.contractId,
            migration: true
          },
          confirmed_at: new Date().toISOString()
        });

        // Create activity log
        await supabase.from('activity_logs').insert({
          property_id: token.property_id,
          tokenization_id: token.id,
          activity_type: 'treasury_migrated',
          description: `MultiSig treasury migrated: ${deployment.contractId}`,
          metadata: {
            treasury_address: deployment.contractAddress,
            contract_id: deployment.contractId,
            transaction_id: deployment.transactionId,
            migration: true
          }
        });

        // Notify property owner
        await supabase.from('notifications').insert({
          user_id: token.properties.owner_id,
          title: 'Treasury Upgraded',
          message: `Your property treasury has been upgraded to a secure MultiSig contract.`,
          notification_type: 'treasury_migrated',
          priority: 'normal',
          action_url: `/property/${token.property_id}/treasury`
        });

        console.log(`✅ Migrated tokenization ${token.id} successfully`);
        results.push({
          tokenization_id: token.id,
          success: true,
          contract_address: deployment.contractAddress,
          contract_id: deployment.contractId,
          transaction_id: deployment.transactionId
        });

      } catch (error: any) {
        console.error(`❌ Failed to migrate ${token.id}:`, error);
        results.push({
          tokenization_id: token.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`\n🎉 Migration complete: ${successCount} succeeded, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        total: tokenizations.length,
        migrated_count: successCount,
        failed_count: failCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
