// supabase/functions/get-hcs-messages/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { topicId, limit = 25, order = 'desc', timestamp } = await req.json();

    if (!topicId) {
      return new Response(JSON.stringify({ error: "Missing topicId" }), { status: 400 });
    }

    // Get Mirror Node URL from environment
    const mirrorNodeUrl = Deno.env.get("HEDERA_MIRROR_NODE_URL") || 
      "https://testnet.mirrornode.hedera.com";

    // Build query parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      order: order
    });

    if (timestamp) {
      params.append('timestamp', timestamp);
    }

    // Fetch from Mirror Node API
    const mirrorResponse = await fetch(
      `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages?${params}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );

    if (!mirrorResponse.ok) {
      throw new Error(`Mirror Node API error: ${mirrorResponse.status} - ${mirrorResponse.statusText}`);
    }

    const data = await mirrorResponse.json();

    // Process and decode messages
    const processedMessages = data.messages?.map((msg: any) => {
      try {
        // Decode base64 message
        const decodedMessage = atob(msg.message);
        
        // Try to parse as JSON, fallback to raw string
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(decodedMessage);
        } catch {
          parsedMessage = decodedMessage;
        }

        return {
          consensus_timestamp: msg.consensus_timestamp,
          timestamp: new Date(parseFloat(msg.consensus_timestamp) * 1000).toISOString(),
          topic_id: msg.topic_id,
          sequence_number: msg.sequence_number,
          running_hash: msg.running_hash,
          message: parsedMessage,
          raw_message: decodedMessage
        };
      } catch (error) {
        console.error('Error processing message:', error);
        return {
          consensus_timestamp: msg.consensus_timestamp,
          timestamp: new Date(parseFloat(msg.consensus_timestamp) * 1000).toISOString(),
          topic_id: msg.topic_id,
          sequence_number: msg.sequence_number,
          error: 'Failed to decode message',
          raw_message: msg.message
        };
      }
    }) || [];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          messages: processedMessages,
          links: data.links,
          total_count: processedMessages.length
        },
        message: `Successfully retrieved ${processedMessages.length} messages for topic ${topicId}.`,
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          // Add CORS headers if needed
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        status: 200,
      },
    );

  } catch (error: any) {
    console.error("Error getting Hedera topic messages:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message, 
        message: "Failed to get Hedera topic messages." 
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});