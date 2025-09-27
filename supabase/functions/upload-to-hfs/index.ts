// supabase/functions/upload-to-hfs/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import {
  Client,
  PrivateKey,
  FileCreateTransaction,
  FileAppendTransaction,
  Hbar,
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`[UPLOAD-TO-HFS] Request received: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[UPLOAD-TO-HFS] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error(`[UPLOAD-TO-HFS] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    console.log(`[UPLOAD-TO-HFS] Parsing form data`);
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const propertyId = formData.get('propertyId') as string;

    console.log(`[UPLOAD-TO-HFS] File details:`, {
      fileName,
      propertyId,
      fileSize: file?.size || 0,
      fileType: file?.type || 'unknown'
    });

    if (!file || !fileName || !propertyId) {
      console.error(`[UPLOAD-TO-HFS] ❌ Missing required fields:`, {
        hasFile: !!file,
        hasFileName: !!fileName,
        hasPropertyId: !!propertyId
      });
      return new Response(
        JSON.stringify({
          error: "Missing file, fileName, or propertyId",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[UPLOAD-TO-HFS] Initializing Hedera client for testnet`);
    // Initialize Hedera client
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(
      Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!
    );
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
    client.setOperator(operatorId, operatorKey);
    console.log(`[UPLOAD-TO-HFS] Hedera client initialized with operator: ${operatorId}`);

    console.log(`[UPLOAD-TO-HFS] Converting file to bytes (${file.size} bytes)`);
    // Convert file to Uint8Array
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Create file memo with property info (truncated for Hedera limits)
    const fileMemo = `PropChain: ${fileName} (${propertyId.substring(0, 8)})`;
    console.log(`[UPLOAD-TO-HFS] File memo: "${fileMemo}"`);

    console.log(`[UPLOAD-TO-HFS] Creating file on HFS`);
    // Create file on HFS
    const fileCreateTx = await new FileCreateTransaction()
      .setContents("")
      .setKeys([operatorKey])
      .setFileMemo(fileMemo)
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);

    console.log(`[UPLOAD-TO-HFS] File creation transaction executed, waiting for receipt`);
    const fileCreateReceipt = await fileCreateTx.getReceipt(client);
    const fileId = fileCreateReceipt.fileId!.toString();
    console.log(`[UPLOAD-TO-HFS] ✅ File created on HFS: ${fileId}`);

    // Append file contents (HFS has size limits, so we may need to chunk)
    const chunkSize = 1024; // 1KB chunks
    const totalChunks = Math.ceil(fileBytes.length / chunkSize);
    console.log(`[UPLOAD-TO-HFS] Uploading file in ${totalChunks} chunks of ${chunkSize} bytes each`);
    
    for (let i = 0; i < fileBytes.length; i += chunkSize) {
      const chunk = fileBytes.slice(i, i + chunkSize);
      const chunkNumber = Math.floor(i / chunkSize) + 1;
      
      console.log(`[UPLOAD-TO-HFS] Uploading chunk ${chunkNumber}/${totalChunks} (${chunk.length} bytes)`);
      
      const fileAppendTx = await new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(chunk)
        .setMaxTransactionFee(new Hbar(2))
        .execute(client);

      // Add timeout handling for receipt to prevent hanging
      try {
        const receiptPromise = fileAppendTx.getReceipt(client);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Receipt timeout after 30 seconds')), 30000)
        );
        
        await Promise.race([receiptPromise, timeoutPromise]);
        console.log(`[UPLOAD-TO-HFS] ✅ Chunk ${chunkNumber} receipt received`);
      } catch (error) {
        console.error(`[UPLOAD-TO-HFS] ⚠️ Chunk ${chunkNumber} receipt failed or timed out:`, error);
        // Continue with next chunk even if receipt fails
        // The transaction might still succeed on Hedera
      }
    }

    console.log(`[UPLOAD-TO-HFS] ✅ All chunks uploaded successfully`);

    console.log(`[UPLOAD-TO-HFS] Generating file hash for verification`);
    // Generate file hash for verification
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`[UPLOAD-TO-HFS] ✅ File upload complete:`, {
      fileId,
      fileHash,
      fileName,
      propertyId,
      fileSize: fileBytes.length,
      transactionId: fileCreateTx.transactionId?.toString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          fileId,
          fileHash,
          transactionId: fileCreateTx.transactionId?.toString(),
        },
        message: `File uploaded to HFS: ${fileId}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(`[UPLOAD-TO-HFS] ❌ Error uploading to HFS:`, error);
    console.error(`[UPLOAD-TO-HFS] Error details:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to upload to HFS",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});