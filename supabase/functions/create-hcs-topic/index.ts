// supabase/functions/create-hcs-topic/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
<<<<<<< HEAD
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
=======
} from "npm:@hashgraph/sdk@^2.73.1";
>>>>>>> 5748e5cb84e7e2bbafb939bc9b9875f665dc7cfd

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { memo } = await req.json();

    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(
      Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!
    );
    client.setOperator(Deno.env.get("HEDERA_OPERATOR_ID")!, operatorKey);

    const topicCreateTx = await new TopicCreateTransaction()
      .setTopicMemo(memo || "PropChain Property Topic")
      .setAdminKey(operatorKey)
      .setSubmitKey(operatorKey)
      .execute(client);

    const receipt = await topicCreateTx.getReceipt(client);
    const topicId = receipt.topicId!.toString();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          topicId,
          transactionId: topicCreateTx.transactionId?.toString(),
        },
        message: `HCS topic created: ${topicId}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating HCS topic:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
});
