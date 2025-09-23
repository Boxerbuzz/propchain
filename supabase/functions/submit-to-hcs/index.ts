// supabase/functions/submit-to-hcs/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { 
  Client, 
  PrivateKey, 
  TopicMessageSubmitTransaction,
  TopicId 
} from "npm:@hashgraph/sdk@^2.73.1";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { topicId, message } = await req.json();

    if (!topicId || !message) {
      return new Response(JSON.stringify({ 
        error: "Missing topicId or message" 
      }), { status: 400 });
    }

    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!);
    client.setOperator(Deno.env.get("HEDERA_OPERATOR_ID")!, operatorKey);

    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(JSON.stringify(message))
      .execute(client);

    const receipt = await submitTx.getReceipt(client);

    return new Response(JSON.stringify({
      success: true,
      data: { 
        transactionId: submitTx.transactionId?.toString(),
        sequenceNumber: receipt.topicSequenceNumber?.toString()
      },
      message: "Message submitted to HCS"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error submitting to HCS:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
});