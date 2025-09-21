// supabase/functions/get-property-activities/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const url = new URL(req.url);
    const propertyId = url.searchParams.get("propertyId");
    const limit = parseInt(url.searchParams.get("limit") || "25");

    if (!propertyId) {
      return new Response(JSON.stringify({ error: "Missing propertyId" }), {
        status: 400,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get property HCS topic ID
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("hcs_topic_id, title")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
      });
    }

    if (!property.hcs_topic_id) {
      return new Response(
        JSON.stringify({
          success: true,
          data: { activities: [] },
          message: "No HCS topic found for this property",
        }),
        { status: 200 }
      );
    }

    // Fetch from Mirror Node
    const mirrorNodeUrl =
      Deno.env.get("HEDERA_MIRROR_NODE_URL") ||
      "https://testnet.mirrornode.hedera.com";

    const mirrorResponse = await fetch(
      `${mirrorNodeUrl}/api/v1/topics/${property.hcs_topic_id}/messages?limit=${limit}&order=desc`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!mirrorResponse.ok) {
      throw new Error(`Mirror Node API error: ${mirrorResponse.status}`);
    }

    const mirrorData = await mirrorResponse.json();

    // Process messages into PropChain activities
    const activities =
      mirrorData.messages
        ?.map((msg: any) => {
          try {
            const decodedMessage = atob(msg.message);
            const messageData = JSON.parse(decodedMessage);

            return {
              id: `${msg.topic_id}-${msg.sequence_number}`,
              timestamp: new Date(parseFloat(msg.consensus_timestamp) * 1000),
              sequence_number: msg.sequence_number,
              activity_type: messageData.type || "unknown",
              title: formatActivityTitle(messageData),
              description: formatActivityDescription(messageData),
              metadata: messageData,
              consensus_timestamp: msg.consensus_timestamp,
            };
          } catch (error) {
            console.error("Error processing activity message:", error);
            return null;
          }
        })
        .filter(Boolean) || [];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          property_title: property.title,
          activities: activities,
          total_count: activities.length,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error getting property activities:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper functions
function formatActivityTitle(messageData: any): string {
  switch (messageData.type) {
    case "PROPERTY_REGISTRATION":
      return "Property Registered";
    case "TOKENIZATION_CREATED":
      return "Tokenization Launched";
    case "INVESTMENT_RECEIVED":
      return "New Investment";
    case "TOKENS_MINTED":
      return "Tokens Distributed";
    case "GOVERNANCE_PROPOSAL":
      return "New Proposal";
    case "GOVERNANCE_VOTE":
      return "Vote Cast";
    case "DIVIDEND_DISTRIBUTED":
      return "Dividend Paid";
    case "KYC_COMPLETED":
      return "KYC Verification";
    default:
      return "Property Activity";
  }
}

function formatActivityDescription(messageData: any): string {
  switch (messageData.type) {
    case "PROPERTY_REGISTRATION":
      return `Property "${messageData.title}" has been registered and submitted for approval`;
    case "TOKENIZATION_CREATED":
      return `Tokenization launched with ${messageData.totalSupply?.toLocaleString()} tokens at ₦${messageData.pricePerToken?.toLocaleString()} each`;
    case "INVESTMENT_RECEIVED":
      return `Investment of ₦${messageData.amount?.toLocaleString()} received for ${messageData.tokensRequested?.toLocaleString()} tokens`;
    case "TOKENS_MINTED":
      return `${messageData.totalTokens?.toLocaleString()} tokens minted and distributed to ${
        messageData.investorCount
      } investors`;
    case "GOVERNANCE_PROPOSAL":
      return `New proposal: "${
        messageData.proposal?.title
      }" - Voting ends ${new Date(
        messageData.proposal?.votingEnd
      ).toLocaleDateString()}`;
    case "GOVERNANCE_VOTE":
      return `Vote cast: ${
        messageData.vote?.choice
      } with ${messageData.vote?.votingPower?.toLocaleString()} voting power`;
    case "DIVIDEND_DISTRIBUTED":
      return `Dividend of ₦${messageData.totalAmount?.toLocaleString()} distributed to token holders`;
    case "KYC_COMPLETED":
      return `KYC verification completed for user`;
    default:
      return `Activity logged: ${JSON.stringify(messageData).substring(
        0,
        100
      )}...`;
  }
}
