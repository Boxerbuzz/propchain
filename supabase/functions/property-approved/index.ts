import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  FileCreateTransaction,
  FileAppendTransaction,
  Hbar,
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PropertyDocument {
  id: string;
  file_url: string;
  document_name: string;
  document_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    const { record, old_record } = await req.json();

    if (!record.id) {
      return new Response(JSON.stringify({ error: "Missing propertyId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Only proceed if approval_status actually changed from non-approved to approved
    if (record.approval_status !== "approved" || 
        (old_record && old_record.approval_status === "approved")) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No approval status change detected, skipping processing" 
      }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize Hedera client
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(
      Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!
    );
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
    client.setOperator(operatorId, operatorKey);

    // Get property details with documents only
    const { data: property, error: propertyError } = await supabaseClient
      .from("properties")
      .select(
        `
        *,
        property_documents(*)
      `
      )
      .eq("id", record.id)
      .single();

    if (propertyError || !property) {
      console.error("Error fetching property:", propertyError);
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    console.log(`Processing approval for property: ${property.title}`);

    // Step 1: Create HCS Topic for the property
    const topicMemo = `PropChain Property: ${property.title} (ID: ${record.id})`;
    const topicCreateTx = await new TopicCreateTransaction()
      .setTopicMemo(topicMemo)
      .setAdminKey(operatorKey)
      .setSubmitKey(operatorKey)
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);

    const topicCreateReceipt = await topicCreateTx.getReceipt(client);
    const topicId = topicCreateReceipt.topicId!.toString();

    console.log(`Created HCS topic: ${topicId}`);

    // Step 2: Upload property documents to HFS
    const documentFiles: PropertyDocument[] = (
      property.property_documents || []
    ).map((doc: any) => ({
      id: doc.id,
      file_url: doc.file_url,
      document_name: doc.document_name,
      document_type: doc.document_type,
    }));

    const hfsFileIds: string[] = [];
    const uploadedFiles: Array<{
      fileName: string;
      fileId: string;
      fileHash: string;
      type: "document";
    }> = [];

    for (const file of documentFiles) {
      try {
        // Download file from Supabase Storage
        const fileResponse = await fetch(file.file_url);
        if (!fileResponse.ok) {
          console.warn(`Failed to download file: ${file.file_url}`);
          continue;
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const fileBytes = new Uint8Array(fileBuffer);

        // Create file memo
        const fileName = file.document_name || `Property File ${file.id}`;
        const fileMemo = `PropChain: ${fileName} for Property ${property.title}`;

        // Create file on HFS
        const fileCreateTx = await new FileCreateTransaction()
          .setContents("")
          .setKeys([operatorKey])
          .setFileMemo(fileMemo)
          .setMaxTransactionFee(new Hbar(2))
          .execute(client);

        const fileCreateReceipt = await fileCreateTx.getReceipt(client);
        const hfsFileId = fileCreateReceipt.fileId!.toString();

        // Append file contents in chunks
        const chunkSize = 1024; // 1KB chunks
        for (let i = 0; i < fileBytes.length; i += chunkSize) {
          const chunk = fileBytes.slice(i, i + chunkSize);

          const fileAppendTx = await new FileAppendTransaction()
            .setFileId(hfsFileId)
            .setContents(chunk)
            .setMaxTransactionFee(new Hbar(2))
            .execute(client);

          await fileAppendTx.getReceipt(client);
        }

        // Generate file hash
        const hashBuffer = await crypto.subtle.digest("SHA-256", fileBytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const fileHash = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        hfsFileIds.push(hfsFileId);
        uploadedFiles.push({
          fileName,
          fileId: hfsFileId,
          fileHash,
          type: "document",
        });

        // Update document record with HFS details and mark as verified
        await supabaseClient
          .from("property_documents")
          .update({
            hfs_file_id: hfsFileId,
            file_hash: fileHash,
            verification_status: "verified",
            verified_at: new Date().toISOString(),
          })
          .eq("id", file.id);

        console.log(`Uploaded to HFS: ${fileName} -> ${hfsFileId}`);
      } catch (error) {
        console.error(`Failed to upload file ${file.id} to HFS:`, error);
      }
    }

    // Step 3: Update property with HCS topic and HFS file IDs
    await supabaseClient
      .from("properties")
      .update({
        hcs_topic_id: topicId,
        hfs_file_ids: hfsFileIds,
        approval_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    // Step 4: Submit approval message to HCS topic
    const approvalMessage = {
      event: "property_approved",
      propertyId: record.id,
      propertyTitle: property.title,
      topicId,
      timestamp: new Date().toISOString(),
      documentsUploaded: {
        total: uploadedFiles.length,
        documents: uploadedFiles.filter((f) => f.type === "document").length,
      },
      hfsFiles: uploadedFiles.map((f) => ({
        name: f.fileName,
        fileId: f.fileId,
        hash: f.fileHash,
        type: f.type,
      })),
    };

    const messageTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(approvalMessage))
      .setMaxTransactionFee(new Hbar(1))
      .execute(client);

    const messageReceipt = await messageTx.getReceipt(client);
    const sequenceNumber = messageReceipt.topicSequenceNumber?.toString();

    console.log(
      `Submitted approval message to topic ${topicId}, sequence: ${sequenceNumber}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          propertyId: record.id,
          topicId,
          hfsFileIds,
          filesUploaded: uploadedFiles.length,
          messageSequenceNumber: sequenceNumber,
        },
        message: `Property approved and ${uploadedFiles.length} documents uploaded to HFS`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error processing property approval:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process property approval",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
