import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[PROPERTY-APPROVED] Request received: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    console.log(`[PROPERTY-APPROVED] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error(`[PROPERTY-APPROVED] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { record, old_record } = await req.json();
    console.log(`[PROPERTY-APPROVED] Processing property approval:`, {
      propertyId: record?.id,
      oldApprovalStatus: old_record?.approval_status,
      newApprovalStatus: record?.approval_status
    });

    if (!record.id) {
      console.error(`[PROPERTY-APPROVED] ❌ Missing propertyId in request`);
      return new Response(JSON.stringify({ error: "Missing propertyId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Only proceed if approval_status actually changed from non-approved to approved
    if (
      record.approval_status !== "approved" ||
      (old_record && old_record.approval_status === "approved")
    ) {
      console.log(`[PROPERTY-APPROVED] ⏭️ No approval status change detected, skipping processing`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "No approval status change detected, skipping processing",
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    console.log(`[PROPERTY-APPROVED] ✅ Approval status change detected, proceeding with workflow`);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`[PROPERTY-APPROVED] Fetching property details with documents`);
    // Get property details with documents
    const { data: property, error: propertyError } = await supabaseClient
      .from("properties")
      .select(`*, property_documents(*)`)
      .eq("id", record.id)
      .single();

    if (propertyError || !property) {
      console.error(`[PROPERTY-APPROVED] ❌ Error fetching property:`, propertyError);
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    console.log(`[PROPERTY-APPROVED] ✅ Property found: "${property.title}" with ${property.property_documents?.length || 0} documents`);

    // Step 1: Create HCS Topic using existing function
    console.log(`[PROPERTY-APPROVED] Step 1: Creating HCS topic`);
    // Truncate property title to fit Hedera memo limit (100 chars max)
    const shortTitle =
      property.title.length > 50
        ? property.title.substring(0, 47) + "..."
        : property.title;
    const topicMemo = `PropChain: ${shortTitle} (${record.id.substring(0, 8)})`;
    console.log(`[PROPERTY-APPROVED] Topic memo: "${topicMemo}"`);

    const hcsResponse = await supabaseClient.functions.invoke(
      "create-hcs-topic",
      {
        body: { memo: topicMemo },
      }
    );

    if (hcsResponse.error) {
      console.error(`[PROPERTY-APPROVED] ❌ Failed to create HCS topic:`, hcsResponse.error);
      throw new Error(
        `Failed to create HCS topic: ${hcsResponse.error.message}`
      );
    }

    console.log(`[PROPERTY-APPROVED] HCS Response:`, hcsResponse);
    console.log(`[PROPERTY-APPROVED] HCS Response Data:`, hcsResponse.data);
    console.log(`[PROPERTY-APPROVED] HCS Response Data Type:`, typeof hcsResponse.data);
    
    // Try different ways to access the topicId
    let topicId = hcsResponse.data?.topicId;
    if (!topicId && hcsResponse.data?.data?.topicId) {
      topicId = hcsResponse.data.data.topicId;
    }
    if (!topicId && typeof hcsResponse.data === 'string') {
      try {
        const parsedData = JSON.parse(hcsResponse.data);
        topicId = parsedData.topicId || parsedData.data?.topicId;
      } catch (e) {
        console.error(`[PROPERTY-APPROVED] Failed to parse HCS response data:`, e);
      }
    }
    
    console.log(`[PROPERTY-APPROVED] ✅ Created HCS topic: ${topicId}`);

    // Step 2: Upload documents to HFS using existing function
    console.log(`[PROPERTY-APPROVED] Step 2: Uploading documents to HFS`);
    const hfsFileIds: string[] = [];
    const totalDocs = property.property_documents?.length || 0;
    console.log(`[PROPERTY-APPROVED] Processing ${totalDocs} documents for HFS upload`);
    console.log(`[PROPERTY-APPROVED] Property documents:`, property.property_documents);

    if (totalDocs === 0) {
      console.log(`[PROPERTY-APPROVED] ⚠️ No documents found for property, skipping HFS upload`);
    }

    for (const [index, doc] of (property.property_documents || []).entries()) {
      console.log(`[PROPERTY-APPROVED] Processing document ${index + 1}/${totalDocs}: ${doc.document_name}`);
      try {
        // Download file from Supabase Storage
        console.log(`[PROPERTY-APPROVED] Downloading file from: ${doc.file_url}`);
        const fileResponse = await fetch(doc.file_url);
        if (!fileResponse.ok) {
          console.warn(`[PROPERTY-APPROVED] ⚠️ Failed to download file: ${doc.file_url}`);
          continue;
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const fileBytes = new Uint8Array(fileBuffer);
        console.log(`[PROPERTY-APPROVED] Downloaded ${fileBytes.length} bytes`);

        // Create FormData for upload-to-hfs function
        const formData = new FormData();
        formData.append("file", new Blob([fileBytes]), doc.document_name);
        formData.append("fileName", doc.document_name);
        formData.append("propertyId", record.id);

        console.log(`[PROPERTY-APPROVED] Uploading ${doc.document_name} to HFS`);
        // Upload to HFS using existing function
        const hfsResponse = await supabaseClient.functions.invoke(
          "upload-to-hfs",
          {
            body: formData,
          }
        );

        console.log(`[PROPERTY-APPROVED] HFS Response:`, hfsResponse);
        console.log(`[PROPERTY-APPROVED] HFS Response Data:`, hfsResponse.data);
        console.log(`[PROPERTY-APPROVED] HFS Response Data Type:`, typeof hfsResponse.data);

        if (hfsResponse.error) {
          console.error(`[PROPERTY-APPROVED] ❌ Failed to upload ${doc.document_name} to HFS:`, hfsResponse.error);
          continue;
        }

        // Try different ways to access the fileId
        let hfsFileId = hfsResponse.data?.fileId;
        if (!hfsFileId && hfsResponse.data?.data?.fileId) {
          hfsFileId = hfsResponse.data.data.fileId;
        }
        if (!hfsFileId && typeof hfsResponse.data === 'string') {
          try {
            const parsedData = JSON.parse(hfsResponse.data);
            hfsFileId = parsedData.fileId || parsedData.data?.fileId;
          } catch (e) {
            console.error(`[PROPERTY-APPROVED] Failed to parse HFS response data:`, e);
          }
        }
        
        hfsFileIds.push(hfsFileId);
        console.log(`[PROPERTY-APPROVED] ✅ Uploaded ${doc.document_name} to HFS: ${hfsFileId}`);

        // Generate file hash
        console.log(`[PROPERTY-APPROVED] Generating file hash for verification`);
        const hashBuffer = await crypto.subtle.digest("SHA-256", fileBytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const fileHash = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Update document record with HFS details and mark as verified
        console.log(`[PROPERTY-APPROVED] Updating document record with HFS details:`, {
          documentId: doc.id,
          hfsFileId,
          fileHash,
          verificationStatus: "verified"
        });
        
        const updateResult = await supabaseClient
          .from("property_documents")
          .update({
            hfs_file_id: hfsFileId,
            file_hash: fileHash,
            verification_status: "verified",
            verified_at: new Date().toISOString(),
          })
          .eq("id", doc.id);

        if (updateResult.error) {
          console.error(`[PROPERTY-APPROVED] ❌ Failed to update document:`, updateResult.error);
        } else {
          console.log(`[PROPERTY-APPROVED] ✅ Document ${doc.document_name} verified and updated`);
        }
      } catch (error) {
        console.error(`[PROPERTY-APPROVED] ❌ Failed to process document ${doc.id}:`, error);
      }
    }

    console.log(`[PROPERTY-APPROVED] ✅ Document upload complete: ${hfsFileIds.length}/${totalDocs} documents uploaded to HFS`);
    console.log(`[PROPERTY-APPROVED] HFS File IDs:`, hfsFileIds);

    // Step 3: Update property with HCS topic and HFS file IDs
    console.log(`[PROPERTY-APPROVED] Step 3: Updating property with blockchain details:`, {
      propertyId: record.id,
      topicId,
      hfsFileIds,
      approvalStatus: "approved"
    });
    
    const propertyUpdateResult = await supabaseClient
      .from("properties")
      .update({
        hcs_topic_id: topicId,
        hfs_file_ids: hfsFileIds,
        approval_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    if (propertyUpdateResult.error) {
      console.error(`[PROPERTY-APPROVED] ❌ Failed to update property:`, propertyUpdateResult.error);
    } else {
      console.log(`[PROPERTY-APPROVED] ✅ Property updated with HCS topic and HFS file IDs`);
    }

    // Step 4: Submit approval message to HCS using existing function
    console.log(`[PROPERTY-APPROVED] Step 4: Submitting approval message to HCS`);
    const approvalMessage = {
      event: "property_approved",
      propertyId: record.id,
      propertyTitle: property.title,
      topicId,
      timestamp: new Date().toISOString(),
      documentsUploaded: {
        total: hfsFileIds.length,
        documents: hfsFileIds.length,
      },
      hfsFileIds,
    };

    console.log(`[PROPERTY-APPROVED] Approval message:`, approvalMessage);
    console.log(`[PROPERTY-APPROVED] Submitting to HCS with topicId: ${topicId}`);

    const hcsMessageResponse = await supabaseClient.functions.invoke(
      "submit-to-hcs",
      {
        body: JSON.stringify({
          topicId,
          message: JSON.stringify(approvalMessage),
        }),
      }
    );

    console.log(`[PROPERTY-APPROVED] HCS Message Response:`, hcsMessageResponse);

    if (hcsMessageResponse.error) {
      console.error(`[PROPERTY-APPROVED] ❌ Failed to submit HCS message:`, hcsMessageResponse.error);
    } else {
      console.log(`[PROPERTY-APPROVED] ✅ Approval message submitted to HCS topic ${topicId}`);
    }

    // Step 5: Send completion notification to property owner
    console.log(`[PROPERTY-APPROVED] Step 5: Sending completion notification`);
    try {
      const notificationResult = await supabaseClient
        .from("notifications")
        .insert({
          user_id: property.owner_id,
          type: "property_verification_complete",
          title: "Property Verification Complete",
          message: `Your property "${property.title}" has been successfully verified and uploaded to the blockchain. It's now available for investment.`,
          metadata: {
            property_id: record.id,
            topic_id: topicId,
            hfs_file_ids: hfsFileIds,
            documents_processed: hfsFileIds.length,
          },
        });

      if (notificationResult.error) {
        console.error(`[PROPERTY-APPROVED] ❌ Failed to send completion notification:`, notificationResult.error);
      } else {
        console.log(`[PROPERTY-APPROVED] ✅ Completion notification sent to user ${property.owner_id}`);
      }
    } catch (error) {
      console.error(`[PROPERTY-APPROVED] ❌ Error sending completion notification:`, error);
    }

    console.log(`[PROPERTY-APPROVED] ✅ Property approval workflow completed successfully`);
    console.log(`[PROPERTY-APPROVED] Summary:`, {
      propertyId: record.id,
      propertyTitle: property.title,
      topicId,
      hfsFileIds,
      filesUploaded: hfsFileIds.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          propertyId: record.id,
          topicId,
          hfsFileIds,
          filesUploaded: hfsFileIds.length,
        },
        message: `Property approved and ${hfsFileIds.length} documents uploaded to HFS`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(`[PROPERTY-APPROVED] ❌ Error processing property approval:`, error);
    console.error(`[PROPERTY-APPROVED] Error details:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process property approval",
        errorType: error.name,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
