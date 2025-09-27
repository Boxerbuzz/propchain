// deno-lint-ignore-file
// supabase/functions/submit-to-hcs/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { 
  Client, 
  PrivateKey, 
  TopicMessageSubmitTransaction,
  TopicId 
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[SUBMIT-TO-HCS] Request received: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    console.log(`[SUBMIT-TO-HCS] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error(`[SUBMIT-TO-HCS] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { topicId, message } = await req.json();
    console.log(`[SUBMIT-TO-HCS] Submitting message to topic: ${topicId}`);
    console.log(`[SUBMIT-TO-HCS] Message content:`, typeof message === 'string' ? message : JSON.stringify(message));

    if (!topicId || !message) {
      console.error(`[SUBMIT-TO-HCS] ❌ Missing required fields:`, {
        hasTopicId: !!topicId,
        hasMessage: !!message
      });
      return new Response(JSON.stringify({ 
        error: "Missing topicId or message" 
      }), { 
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log(`[SUBMIT-TO-HCS] Initializing Hedera client for testnet`);
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!);
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
    client.setOperator(operatorId, operatorKey);
    console.log(`[SUBMIT-TO-HCS] Hedera client initialized with operator: ${operatorId}`);

    console.log(`[SUBMIT-TO-HCS] Creating message submit transaction`);
    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(typeof message === 'string' ? message : JSON.stringify(message))
      .execute(client);

    console.log(`[SUBMIT-TO-HCS] Message transaction executed, waiting for receipt`);
    const receipt = await submitTx.getReceipt(client);
    const sequenceNumber = receipt.topicSequenceNumber?.toString();
    const transactionId = submitTx.transactionId?.toString();

    console.log(`[SUBMIT-TO-HCS] ✅ Message submitted successfully:`, {
      topicId,
      sequenceNumber,
      transactionId,
      messageLength: typeof message === 'string' ? message.length : JSON.stringify(message).length
    });

    return new Response(JSON.stringify({
      success: true,
      data: { 
        transactionId,
        sequenceNumber
      },
      message: "Message submitted to HCS"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error(`[SUBMIT-TO-HCS] ❌ Error submitting to HCS:`, error);
    console.error(`[SUBMIT-TO-HCS] Error details:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      errorType: error.name,
    }), { 
      status: 500,
      headers: corsHeaders,
    });
  }
});