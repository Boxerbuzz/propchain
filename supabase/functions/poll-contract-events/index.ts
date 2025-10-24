import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Poll Hedera Mirror Node for contract events and trigger webhook processing
 * This function should be called periodically (e.g., every 5 minutes) via cron
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("[POLL] Starting contract event polling...");

    // Get all active contracts
    const { data: contracts } = await supabase
      .from("smart_contract_config")
      .select("*")
      .eq("is_active", true);

    if (!contracts || contracts.length === 0) {
      console.log("[POLL] No active contracts configured");
      return new Response(
        JSON.stringify({ message: "No active contracts to poll" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mirrorNodeUrl = Deno.env.get("HEDERA_MIRROR_NODE_URL") || "https://testnet.mirrornode.hedera.com";
    const eventsFound: any[] = [];

    // Poll each contract for new events
    for (const contract of contracts) {
      console.log(`[POLL] Checking contract: ${contract.contract_name}`);

      // Get last processed block for this contract
      const { data: lastTx } = await supabase
        .from("smart_contract_transactions")
        .select("block_number")
        .eq("contract_name", contract.contract_name)
        .order("block_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      const fromBlock = lastTx?.block_number || 0;

      // Query Hedera Mirror Node for contract transactions
      const contractId = contract.contract_address.replace("0x", "0.0."); // Convert to Hedera format
      const apiUrl = `${mirrorNodeUrl}/api/v1/contracts/${contractId}/results?limit=100&order=asc&block.number=gte:${fromBlock}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          console.log(`[POLL] Found ${data.results.length} transactions for ${contract.contract_name}`);

          for (const result of data.results) {
            // Parse event logs from transaction
            if (result.logs && result.logs.length > 0) {
              for (const log of result.logs) {
                const event = parseEventLog(log, contract);
                if (event) {
                  eventsFound.push({
                    eventName: event.name,
                    contractName: contract.contract_name,
                    contractAddress: contract.contract_address,
                    transactionHash: result.hash,
                    blockNumber: result.block_number,
                    data: event.data,
                  });
                }
              }
            }
          }
        }
      } catch (fetchError: any) {
        console.error(`[POLL] Error fetching events for ${contract.contract_name}:`, fetchError);
      }
    }

    // Process found events by calling the webhook
    if (eventsFound.length > 0) {
      console.log(`[POLL] Processing ${eventsFound.length} events`);

      for (const event of eventsFound) {
        try {
          // Call smart-contract-webhook to process the event
          await supabase.functions.invoke("smart-contract-webhook", {
            body: event,
          });
          console.log(`[POLL] Processed event: ${event.eventName}`);
        } catch (invokeError: any) {
          console.error(`[POLL] Error processing event:`, invokeError);
        }
      }
    } else {
      console.log("[POLL] No new events found");
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventsProcessed: eventsFound.length,
        message: `Processed ${eventsFound.length} events`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[POLL] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Parse event log data based on contract ABI
 */
function parseEventLog(log: any, contract: any): { name: string; data: any } | null {
  try {
    // Extract event signature from log topics
    const eventSignature = log.topics?.[0];
    if (!eventSignature) return null;

    // Map common event signatures to event names
    // NOTE: In production, use the contract ABI to properly decode events
    const eventMap: Record<string, string> = {
      // ProposalExecuted
      "0x8f8636c7757ca9b7d154e1d44ca90d8e8c885b9eac417c59bbf8eb7779ca6404": "ProposalExecuted",
      // FundsLocked
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef": "FundsLocked",
      // DividendClaimed
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890": "DividendClaimed",
      // WithdrawalExecuted
      "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba": "WithdrawalExecuted",
    };

    const eventName = eventMap[eventSignature];
    if (!eventName) {
      console.log(`[POLL] Unknown event signature: ${eventSignature}`);
      return null;
    }

    // Decode event data (simplified - in production use proper ABI decoder)
    const eventData = decodeEventData(eventName, log);

    return {
      name: eventName,
      data: eventData,
    };
  } catch (error: any) {
    console.error("[POLL] Error parsing event log:", error);
    return null;
  }
}

/**
 * Decode event data based on event name
 * NOTE: This is simplified - in production, use the contract ABI for proper decoding
 */
function decodeEventData(eventName: string, log: any): any {
  switch (eventName) {
    case "ProposalExecuted":
      return {
        proposalId: log.topics?.[1] || "",
        amountReleased: parseInt(log.data || "0", 16),
      };
    case "FundsLocked":
      return {
        proposalId: log.topics?.[1] || "",
        amount: parseInt(log.data || "0", 16),
      };
    case "DividendClaimed":
      return {
        distributionId: log.topics?.[1] || "",
        recipient: log.topics?.[2] || "",
        amount: parseInt(log.data || "0", 16),
      };
    case "WithdrawalExecuted":
      return {
        requestId: parseInt(log.topics?.[1] || "0", 16),
        amount: parseInt(log.data || "0", 16),
      };
    default:
      return {};
  }
}
