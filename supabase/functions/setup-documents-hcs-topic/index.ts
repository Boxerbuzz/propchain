import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Client, TopicCreateTransaction, PrivateKey } from 'npm:@hashgraph/sdk@^2.73.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Setting up HCS topic for document verification...');

    // Initialize Hedera client
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY');

    if (!operatorId || !operatorKey) {
      throw new Error('Hedera credentials not configured');
    }

    const client = Client.forTestnet();
    client.setOperator(operatorId, PrivateKey.fromStringECDSA(operatorKey));

    // Create HCS topic for document hashes
    const transaction = new TopicCreateTransaction()
      .setTopicMemo('PropChain Investment Document Verification - Immutable document hash registry')
      .setAdminKey(PrivateKey.fromStringECDSA(operatorKey))
      .setSubmitKey(PrivateKey.fromStringECDSA(operatorKey));

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const topicId = receipt.topicId?.toString();

    if (!topicId) {
      throw new Error('Failed to create HCS topic');
    }

    console.log(`✅ Created HCS topic: ${topicId}`);
    console.log(`📝 Add this to your environment variables: DOCUMENTS_HCS_TOPIC_ID=${topicId}`);

    return new Response(
      JSON.stringify({
        success: true,
        topicId: topicId,
        message: `HCS topic created successfully. Add DOCUMENTS_HCS_TOPIC_ID=${topicId} to your environment variables.`,
        instructions: [
          '1. Go to Supabase Dashboard → Edge Functions → Settings',
          `2. Add new secret: DOCUMENTS_HCS_TOPIC_ID = ${topicId}`,
          '3. Redeploy the generate-investment-documents function',
          `4. View topic on HashScan: https://hashscan.io/testnet/topic/${topicId}`
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating HCS topic:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
