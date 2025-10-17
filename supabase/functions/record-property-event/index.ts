// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PropertyEventRequest {
  property_id: string;
  event_type: "inspection" | "rental" | "purchase" | "maintenance";
  event_data: any;
}

serve(async (req) => {
  console.log(`[RECORD-EVENT] Request received: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
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

    const token = authHeader.replace("Bearer ", "");
    const isServiceRole = token === supabaseServiceKey;

    const requestData: PropertyEventRequest = await req.json();
    const { property_id, event_type, event_data } = requestData;

    let userId: string;

    if (isServiceRole) {
      // Service-to-service call - get user from property owner
      console.log(`[RECORD-EVENT] Service role call - getting owner for property ${property_id}`);
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("owner_id")
        .eq("id", property_id)
        .single();
      
      if (propError || !property) {
        throw new Error("Property not found");
      }
      userId = property.owner_id;
    } else {
      // User-initiated call - validate JWT
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError || !userData.user) {
        throw new Error("Unauthorized");
      }
      userId = userData.user.id;
    }

    console.log(`[RECORD-EVENT] Recording ${event_type} event for property ${property_id}`);

    // Verify property exists and get HCS topic ID
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, hcs_topic_id, owner_id")
      .eq("id", property_id)
      .single();

    if (propertyError || !property) {
      throw new Error("Property not found");
    }

    // Verify user owns the property (unless service role)
    if (!isServiceRole && property.owner_id !== userId) {
      throw new Error("You don't have permission to record events for this property");
    }

    if (!property.hcs_topic_id) {
      throw new Error("Property does not have an HCS topic ID");
    }

    let eventId: string;
    let specificEventId: string;
    let hcsTransactionId: string | null = null;
    let hcsSequenceNumber: string | null = null;

    // Create main property_event record
    const eventSummary = generateEventSummary(event_type, event_data);
    
    const { data: propertyEvent, error: eventError } = await supabase
      .from("property_events")
      .insert({
        property_id,
        event_type,
        event_status: "completed",
        event_date: new Date().toISOString(),
        conducted_by: userId,
        conducted_by_name: event_data.conductor_name || "",
        conducted_by_company: event_data.conductor_company || "",
        event_details: event_data,
        amount_ngn: event_data.amount_ngn || null,
        amount_usd: event_data.amount_usd || null,
        hcs_topic_id: property.hcs_topic_id,
        notes: event_data.notes || "",
        summary: eventSummary,
        created_by: userId,
      })
      .select()
      .single();

    if (eventError) {
      console.error("[RECORD-EVENT] Error creating property event:", eventError);
      throw eventError;
    }

    eventId = propertyEvent.id;
    console.log(`[RECORD-EVENT] Created property event ${eventId}`);

    // Create specific event record based on type
    if (event_type === "inspection") {
      const { data: inspection, error: inspectionError } = await supabase
        .from("property_inspections")
        .insert({
          property_event_id: eventId,
          property_id,
          inspection_type: event_data.inspection_type,
          inspection_date: new Date().toISOString(),
          structural_condition: event_data.structural_condition,
          foundation_status: event_data.foundation_status,
          roof_status: event_data.roof_status,
          walls_status: event_data.walls_status,
          electrical_status: event_data.electrical_status,
          plumbing_status: event_data.plumbing_status,
          room_assessments: event_data.room_assessments || [],
          issues_found: event_data.issues_found || [],
          required_repairs: event_data.required_repairs || [],
          estimated_repair_cost: event_data.estimated_repair_cost || 0,
          overall_rating: event_data.overall_rating,
          market_value_estimate: event_data.market_value_estimate || null,
          rental_value_estimate: event_data.rental_value_estimate || null,
          inspector_name: event_data.inspector_name,
          inspector_license: event_data.inspector_license || null,
          inspector_company: event_data.inspector_company || null,
        })
        .select()
        .single();

      if (inspectionError) throw inspectionError;
      specificEventId = inspection.id;
    } else if (event_type === "rental") {
      const { data: rental, error: rentalError } = await supabase
        .from("property_rentals")
        .insert({
          property_event_id: eventId,
          property_id,
          rental_type: event_data.rental_type,
          tenant_name: event_data.tenant_name,
          tenant_email: event_data.tenant_email || null,
          tenant_phone: event_data.tenant_phone || null,
          tenant_id_number: event_data.tenant_id_number || null,
          monthly_rent_ngn: event_data.monthly_rent_ngn,
          security_deposit_ngn: event_data.security_deposit_ngn || 0,
          agency_fee_ngn: event_data.agency_fee_ngn || 0,
          legal_fee_ngn: event_data.legal_fee_ngn || 0,
          start_date: event_data.start_date,
          end_date: event_data.end_date,
          lease_duration_months: event_data.lease_duration_months,
          payment_method: event_data.payment_method || null,
          payment_status: event_data.payment_status || "pending",
          amount_paid_ngn: event_data.amount_paid_ngn || 0,
          utilities_included: event_data.utilities_included || [],
          special_terms: event_data.special_terms || null,
          rental_status: "active",
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (rentalError) throw rentalError;
      specificEventId = rental.id;
    } else if (event_type === "purchase") {
      const { data: purchase, error: purchaseError } = await supabase
        .from("property_purchases")
        .insert({
          property_event_id: eventId,
          property_id,
          transaction_type: event_data.transaction_type,
          buyer_name: event_data.buyer_name || null,
          buyer_email: event_data.buyer_email || null,
          buyer_phone: event_data.buyer_phone || null,
          buyer_id_number: event_data.buyer_id_number || null,
          seller_name: event_data.seller_name || null,
          purchase_price_ngn: event_data.purchase_price_ngn,
          purchase_price_usd: event_data.purchase_price_usd || null,
          tokens_involved: event_data.tokens_involved || null,
          percentage_sold: event_data.percentage_sold || null,
          payment_method: event_data.payment_method || null,
          payment_plan: event_data.payment_plan || "outright",
          down_payment_ngn: event_data.down_payment_ngn || 0,
          remaining_balance_ngn: event_data.remaining_balance_ngn || 0,
          transaction_status: event_data.transaction_status || "pending",
          completion_date: event_data.completion_date || null,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;
      specificEventId = purchase.id;
    } else if (event_type === "maintenance") {
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("property_maintenance")
        .insert({
          property_event_id: eventId,
          property_id,
          maintenance_type: event_data.maintenance_type,
          maintenance_date: new Date().toISOString(),
          issue_category: event_data.issue_category,
          issue_severity: event_data.issue_severity,
          issue_description: event_data.issue_description,
          contractor_name: event_data.contractor_name || null,
          contractor_company: event_data.contractor_company || null,
          contractor_phone: event_data.contractor_phone || null,
          estimated_cost_ngn: event_data.estimated_cost_ngn || null,
          actual_cost_ngn: event_data.actual_cost_ngn || null,
          work_performed: event_data.work_performed || null,
          maintenance_status: event_data.maintenance_status || "scheduled",
          payment_status: event_data.payment_status || "pending",
          follow_up_required: event_data.follow_up_required || false,
          notes: event_data.notes || null,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (maintenanceError) throw maintenanceError;
      specificEventId = maintenance.id;
    }

    // Submit to HCS
    console.log(`[RECORD-EVENT] Submitting to HCS topic ${property.hcs_topic_id}`);
    
    const hcsMessage = {
      event_type,
      property_id,
      property_title: property.title,
      event_id: eventId,
      timestamp: new Date().toISOString(),
      summary: eventSummary,
      details: event_data,
      recorded_by: {
        user_id: userId,
        name: event_data.conductor_name || "Unknown",
      },
    };

    try {
      const { data: hcsResponse, error: hcsError } = await supabase.functions.invoke(
        "submit-to-hcs",
        {
          body: {
            topicId: property.hcs_topic_id,
            message: JSON.stringify(hcsMessage),
          },
        }
      );

      if (hcsError) {
        console.error("[RECORD-EVENT] HCS submission error:", hcsError);
      } else if (hcsResponse?.success) {
        hcsTransactionId = hcsResponse.data?.transactionId || null;
        hcsSequenceNumber = hcsResponse.data?.sequenceNumber || null;
        
        console.log(`[RECORD-EVENT] HCS submission successful: ${hcsTransactionId}`);

        // Update event with HCS transaction details
        await supabase
          .from("property_events")
          .update({
            hcs_transaction_id: hcsTransactionId,
            hcs_sequence_number: hcsSequenceNumber,
          })
          .eq("id", eventId);
      }
    } catch (hcsErr) {
      console.error("[RECORD-EVENT] HCS submission failed:", hcsErr);
      // Continue execution even if HCS fails
    }

    // Create activity log
    await supabase.from("activity_logs").insert({
      user_id: userId,
      property_id,
      activity_type: `property_${event_type}`,
      activity_category: "property_event",
      description: eventSummary,
      metadata: {
        event_id: eventId,
        event_type,
        specific_event_id: specificEventId,
      },
      hcs_transaction_id: hcsTransactionId,
    });

    // Get tokenization_id for chat room lookup
    const { data: propertyTokenization } = await supabase
      .from("tokenizations")
      .select("id")
      .eq("property_id", property_id)
      .single();

    // Post event notification to chat room
    if (propertyTokenization?.id) {
      const { data: chatRoom } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("property_id", property_id)
        .eq("tokenization_id", propertyTokenization.id)
        .eq("room_type", "investment")
        .single();

      if (chatRoom) {
        console.log(`[RECORD-EVENT] Posting to chat room ${chatRoom.id}`);
        
        let messageType = 'event';
        let chatMetadata: any = {
          event_id: eventId,
          event_type,
          property_id,
          hcs_transaction_id: hcsTransactionId,
          ...event_data
        };

        // For maintenance events, create a governance proposal first
        if (event_type === 'maintenance') {
          console.log(`[RECORD-EVENT] Creating maintenance proposal`);
          
          const { data: proposalResponse, error: proposalError } = await supabase.functions.invoke(
            'create-maintenance-proposal',
            {
              body: {
                property_id,
                tokenization_id: propertyTokenization.id,
                maintenance_event_id: specificEventId,
                event_data
              },
              headers: {
                Authorization: authHeader
              }
            }
          );

          if (!proposalError && proposalResponse?.proposal_id) {
            messageType = 'maintenance_proposal';
            chatMetadata.proposal_id = proposalResponse.proposal_id;
            chatMetadata.tokenization_id = propertyTokenization.id;
            chatMetadata.voting_end = new Date(Date.now() + (proposalResponse.voting_period_days || 7) * 24 * 60 * 60 * 1000).toISOString();
            chatMetadata.approval_threshold = proposalResponse.approval_threshold || 60;
            chatMetadata.status = proposalResponse.auto_approved ? 'approved' : 'active';
            
            console.log(`[RECORD-EVENT] Created proposal ${proposalResponse.proposal_id}`);
          } else {
            console.error("[RECORD-EVENT] Failed to create proposal:", proposalError);
          }
        } else {
          // For non-maintenance events, set specific message types
          messageType = `${event_type}_event`;
        }

        // Send chat notification
        const { error: chatError } = await supabase.functions.invoke('send-chat-system-message', {
          body: {
            room_id: chatRoom.id,
            message_text: eventSummary,
            message_type: messageType,
            metadata: chatMetadata
          }
        });

        if (chatError) {
          console.error("[RECORD-EVENT] Failed to send chat message:", chatError);
        } else {
          console.log(`[RECORD-EVENT] Posted ${messageType} message to chat`);
        }
      }
    }

    console.log(`[RECORD-EVENT] Successfully recorded ${event_type} event`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${event_type} event recorded successfully`,
        data: {
          event_id: eventId,
          specific_event_id: specificEventId,
          hcs_transaction_id: hcsTransactionId,
          hcs_sequence_number: hcsSequenceNumber,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[RECORD-EVENT] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to record property event",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});

function generateEventSummary(eventType: string, eventData: any): string {
  switch (eventType) {
    case "inspection":
      return `Property inspection completed by ${eventData.inspector_name || "Unknown"} - Overall rating: ${eventData.overall_rating}/10, Condition: ${eventData.structural_condition || "N/A"}`;
    case "rental":
      return `Property rented to ${eventData.tenant_name} for ₦${eventData.monthly_rent_ngn?.toLocaleString()}/month from ${eventData.start_date} to ${eventData.end_date}`;
    case "purchase":
      return `${eventData.transaction_type || "Purchase"} transaction for ₦${eventData.purchase_price_ngn?.toLocaleString()} - ${eventData.transaction_status}`;
    case "maintenance":
      return `${eventData.maintenance_type} maintenance: ${eventData.issue_category} - ${eventData.issue_severity} severity - ${eventData.maintenance_status}`;
    default:
      return `Property ${eventType} event recorded`;
  }
}
