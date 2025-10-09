import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MaintenanceProposalRequest {
  property_id: string;
  tokenization_id: string;
  maintenance_event_id: string;
  event_data: {
    maintenance_type: string;
    issue_category: string;
    issue_severity: string;
    issue_description: string;
    estimated_cost_ngn: number;
    contractor_name?: string;
    contractor_company?: string;
    contractor_phone?: string;
    work_performed?: string;
  };
}

serve(async (req) => {
  console.log(`[CREATE-MAINTENANCE-PROPOSAL] Request received: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }

    const requestData: MaintenanceProposalRequest = await req.json();
    const { property_id, tokenization_id, maintenance_event_id, event_data } = requestData;

    console.log(`[CREATE-MAINTENANCE-PROPOSAL] Creating proposal for maintenance ${maintenance_event_id}`);

    // Verify tokenization exists and get details
    const { data: tokenization, error: tokenError } = await supabase
      .from("tokenizations")
      .select("id, token_name, token_symbol, total_supply, status")
      .eq("id", tokenization_id)
      .single();

    if (tokenError || !tokenization) {
      throw new Error("Tokenization not found");
    }

    // Auto-approve small repairs (< ₦50,000) for critical issues
    const isSmallCriticalRepair = 
      event_data.issue_severity === "critical" && 
      event_data.estimated_cost_ngn < 50000;

    // Calculate voting parameters based on severity and cost
    let votingPeriodDays = 7;
    let approvalThreshold = 60.0;
    let quorumRequired = 30.0;

    if (event_data.issue_severity === "critical") {
      votingPeriodDays = 3; // Faster voting for critical issues
      approvalThreshold = 55.0; // Lower threshold for emergencies
      quorumRequired = 25.0; // Lower quorum for urgent matters
    } else if (event_data.issue_severity === "low") {
      votingPeriodDays = 14; // More time for non-urgent issues
      approvalThreshold = 65.0; // Higher threshold for non-urgent
    }

    // Higher cost maintenance requires higher approval
    if (event_data.estimated_cost_ngn > 500000) {
      approvalThreshold += 10; // Add 10% for expensive repairs
      quorumRequired += 10; // Require more participation
    }

    const votingStart = new Date();
    const votingEnd = new Date(votingStart.getTime() + votingPeriodDays * 24 * 60 * 60 * 1000);

    // Create governance proposal
    const { data: proposal, error: proposalError } = await supabase
      .from("governance_proposals")
      .insert({
        property_id,
        tokenization_id,
        proposer_id: userData.user.id,
        title: `Maintenance Request: ${event_data.issue_category} - ${event_data.issue_severity} Severity`,
        description: event_data.issue_description,
        proposal_type: "maintenance",
        budget_ngn: event_data.estimated_cost_ngn,
        voting_start: votingStart.toISOString(),
        voting_end: votingEnd.toISOString(),
        status: isSmallCriticalRepair ? "approved" : "active",
        approval_threshold: approvalThreshold,
        quorum_required: quorumRequired,
      })
      .select()
      .single();

    if (proposalError) {
      console.error("[CREATE-MAINTENANCE-PROPOSAL] Error creating proposal:", proposalError);
      throw proposalError;
    }

    console.log(`[CREATE-MAINTENANCE-PROPOSAL] Created proposal ${proposal.id}`);

    // Link proposal to maintenance record
    await supabase
      .from("property_maintenance")
      .update({ proposal_id: proposal.id })
      .eq("id", maintenance_event_id);

    // Create activity log
    await supabase.from("activity_logs").insert({
      user_id: userData.user.id,
      property_id,
      tokenization_id,
      activity_type: "governance_proposal_created",
      activity_category: "governance",
      description: `Maintenance proposal created: ${event_data.issue_category} (${event_data.issue_severity} severity)`,
      metadata: {
        proposal_id: proposal.id,
        maintenance_event_id,
        budget_ngn: event_data.estimated_cost_ngn,
        auto_approved: isSmallCriticalRepair,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        proposal_id: proposal.id,
        auto_approved: isSmallCriticalRepair,
        voting_period_days: votingPeriodDays,
        approval_threshold: approvalThreshold,
        quorum_required: quorumRequired,
        message: isSmallCriticalRepair 
          ? "Critical repair auto-approved (under ₦50,000)"
          : "Maintenance proposal created and submitted for voting",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[CREATE-MAINTENANCE-PROPOSAL] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create maintenance proposal",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
