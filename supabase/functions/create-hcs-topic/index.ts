// supabase/functions/create-hcs-topic/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[CREATE-HCS-TOPIC] Request received: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    console.log(`[CREATE-HCS-TOPIC] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error(`[CREATE-HCS-TOPIC] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { memo } = await req.json();
    console.log(`[CREATE-HCS-TOPIC] Creating topic with memo: "${memo || 'PropChain Property Topic'}"`);

    console.log(`[CREATE-HCS-TOPIC] Initializing Hedera client for testnet`);
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(
      Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!
    );
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
    client.setOperator(operatorId, operatorKey);
    console.log(`[CREATE-HCS-TOPIC] Hedera client initialized with operator: ${operatorId}`);

    console.log(`[CREATE-HCS-TOPIC] Creating topic transaction`);
    const topicCreateTx = await new TopicCreateTransaction()
      .setTopicMemo(memo || "PropChain Property Topic")
      .setAdminKey(operatorKey)
      .setSubmitKey(operatorKey)
      .execute(client);

    console.log(`[CREATE-HCS-TOPIC] Topic transaction executed, waiting for receipt`);
    const receipt = await topicCreateTx.getReceipt(client);
    const topicId = receipt.topicId!.toString();
    const transactionId = topicCreateTx.transactionId?.toString();

    console.log(`[CREATE-HCS-TOPIC] ✅ Successfully created HCS topic: ${topicId}`);
    console.log(`[CREATE-HCS-TOPIC] Transaction ID: ${transactionId}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          topicId,
          transactionId,
        },
        message: `HCS topic created: ${topicId}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(`[CREATE-HCS-TOPIC] ❌ Error creating HCS topic:`, error);
    console.error(`[CREATE-HCS-TOPIC] Error details:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: error.name,
      }),
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});