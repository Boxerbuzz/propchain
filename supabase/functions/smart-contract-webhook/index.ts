import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractEvent {
  eventName: string;
  contractName: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  data: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const event: ContractEvent = await req.json();
    console.log("[WEBHOOK] Received contract event:", event.eventName);

    // Route to appropriate handler based on event type
    switch (event.eventName) {
      case "ProposalExecuted":
        await handleProposalExecuted(supabase, event);
        break;
      case "FundsLocked":
        await handleFundsLocked(supabase, event);
        break;
      case "FundsReleased":
        await handleFundsReleased(supabase, event);
        break;
      case "DividendClaimed":
        await handleDividendClaimed(supabase, event);
        break;
      case "DistributionCreated":
        await handleDistributionCreated(supabase, event);
        break;
      case "WithdrawalExecuted":
        await handleWithdrawalExecuted(supabase, event);
        break;
      case "WithdrawalSubmitted":
        await handleWithdrawalSubmitted(supabase, event);
        break;
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.eventName}`);
    }

    // Update transaction status
    await supabase
      .from("smart_contract_transactions")
      .update({
        transaction_status: "confirmed",
        block_number: event.blockNumber,
        confirmed_at: new Date().toISOString(),
      })
      .eq("transaction_hash", event.transactionHash);

    return new Response(
      JSON.stringify({ success: true, message: "Event processed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[WEBHOOK] Error processing event:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleProposalExecuted(supabase: any, event: ContractEvent) {
  const { proposalId, amountReleased } = event.data;

  await supabase
    .from("governance_proposals")
    .update({
      status: "executed",
      execution_status: "completed",
      funds_released: true,
      funds_released_at: new Date().toISOString(),
      execution_contract_tx: event.transactionHash,
    })
    .eq("contract_proposal_id", proposalId);

  console.log(`[WEBHOOK] Proposal ${proposalId} executed with ${amountReleased} released`);
}

async function handleFundsLocked(supabase: any, event: ContractEvent) {
  const { proposalId, amount } = event.data;

  await supabase
    .from("governance_proposals")
    .update({
      funds_locked: true,
      funds_locked_at: new Date().toISOString(),
      status: "approved_pending_execution",
    })
    .eq("contract_proposal_id", proposalId);

  // Create activity log
  await supabase.from("activity_logs").insert({
    activity_type: "proposal_funds_locked",
    description: `Funds locked for proposal execution: ${amount}`,
    metadata: {
      proposal_id: proposalId,
      amount,
      transaction_hash: event.transactionHash,
    },
  });

  console.log(`[WEBHOOK] Funds locked for proposal ${proposalId}: ${amount}`);
}

async function handleFundsReleased(supabase: any, event: ContractEvent) {
  const { proposalId, recipient, amount } = event.data;

  await supabase
    .from("governance_proposals")
    .update({
      funds_released: true,
      funds_released_at: new Date().toISOString(),
      execution_status: "completed",
      execution_notes: `Funds released to ${recipient}`,
    })
    .eq("contract_proposal_id", proposalId);

  console.log(`[WEBHOOK] Funds released for proposal ${proposalId} to ${recipient}: ${amount}`);
}

async function handleDividendClaimed(supabase: any, event: ContractEvent) {
  const { distributionId, recipient, amount } = event.data;

  // Find the dividend payment record
  const { data: distribution } = await supabase
    .from("dividend_distributions")
    .select("id")
    .eq("contract_distribution_id", distributionId)
    .single();

  if (distribution) {
    // Update payment status
    await supabase
      .from("dividend_payments")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("distribution_id", distribution.id)
      .eq("recipient_id", recipient);

    // Update distribution total claimed
    await supabase.rpc("increment", {
      table_name: "dividend_distributions",
      row_id: distribution.id,
      column_name: "total_claimed_amount",
      increment_by: amount,
    });
  }

  console.log(`[WEBHOOK] Dividend claimed: ${amount} by ${recipient}`);
}

async function handleDistributionCreated(supabase: any, event: ContractEvent) {
  const { distributionId, totalAmount, perTokenAmount, snapshotBlock } = event.data;

  await supabase
    .from("dividend_distributions")
    .update({
      contract_transaction_hash: event.transactionHash,
      snapshot_block_number: snapshotBlock,
      payment_status: "active",
    })
    .eq("contract_distribution_id", distributionId);

  console.log(`[WEBHOOK] Distribution created: ${distributionId} with ${totalAmount} total`);
}

async function handleWithdrawalExecuted(supabase: any, event: ContractEvent) {
  const { requestId, amount } = event.data;

  // Update treasury transaction
  await supabase
    .from("property_treasury_transactions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      hedera_transaction_id: event.transactionHash,
    })
    .eq("metadata->>withdrawalRequestId", requestId);

  console.log(`[WEBHOOK] Withdrawal executed: ${requestId} for ${amount}`);
}

async function handleWithdrawalSubmitted(supabase: any, event: ContractEvent) {
  const { requestId, recipient, amount, reason } = event.data;

  // Create treasury transaction record
  await supabase.from("property_treasury_transactions").insert({
    transaction_type: "withdrawal",
    status: "pending_approval",
    amount_ngn: amount,
    description: reason,
    metadata: {
      withdrawalRequestId: requestId,
      recipient,
      multisig_status: "pending",
    },
  });

  // Notify signers
  // TODO: Send notifications to multisig signers

  console.log(`[WEBHOOK] Withdrawal submitted: ${requestId} for ${amount}`);
}
