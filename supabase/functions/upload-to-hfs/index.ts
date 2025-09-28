// supabase/functions/upload-to-hfs/index.ts
// Hash file and upload only the hash to HFS for lightweight storage
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

  let client: Client | null = null;

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
    client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(
      Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!
    );
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
    client.setOperator(operatorId, operatorKey);
    console.log(`[UPLOAD-TO-HFS] Hedera client initialized with operator: ${operatorId}`);

    console.log(`[UPLOAD-TO-HFS] Converting file to bytes (${file.size} bytes)`);
    // Convert file to Uint8Array for hashing
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Generate file hash for verification
    console.log(`[UPLOAD-TO-HFS] Generating SHA-256 hash`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log(`[UPLOAD-TO-HFS] Generated file hash: ${fileHash}`);

    // Convert hash string to bytes for HFS storage
    const hashBytes = new TextEncoder().encode(fileHash);
    console.log(`[UPLOAD-TO-HFS] Hash as bytes: ${hashBytes.length} bytes`);

    // Create file memo with property info (keep under 100 bytes for Hedera)
    const fileMemo = `PropChain-HASH: ${fileName.substring(0, 30)} (${propertyId.substring(0, 8)})`;
    console.log(`[UPLOAD-TO-HFS] File memo: "${fileMemo}"`);

    console.log(`[UPLOAD-TO-HFS] Creating file on HFS for hash storage`);
    // Create file on HFS for hash storage
    const fileCreateTx = await new FileCreateTransaction()
      .setContents("")
      .setKeys([operatorKey])
      .setFileMemo(fileMemo)
      .setMaxTransactionFee(new Hbar(5))
      .execute(client);

    console.log(`[UPLOAD-TO-HFS] File creation transaction executed, waiting for receipt`);
    const fileCreateReceipt = await fileCreateTx.getReceipt(client);
    const fileId = fileCreateReceipt.fileId!.toString();
    console.log(`[UPLOAD-TO-HFS] ✅ File created on HFS: ${fileId}`);

    // Upload hash as content (single append transaction)
    console.log(`[UPLOAD-TO-HFS] Uploading hash to HFS`);
    const startTime = Date.now();
    
    try {
      const fileAppendTx = await new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(hashBytes)
        .setMaxTransactionFee(new Hbar(2))
        .execute(client);

      await fileAppendTx.getReceipt(client);
      
      const uploadTime = Date.now() - startTime;
      console.log(`[UPLOAD-TO-HFS] ✅ Hash uploaded successfully in ${uploadTime}ms`);
      
    } catch (error) {
      console.error(`[UPLOAD-TO-HFS] ❌ Failed to upload hash:`, error);
      throw error;
    }

    const uploadTime = Date.now() - startTime;
    console.log(`[UPLOAD-TO-HFS] ✅ Hash upload complete:`, {
      fileId,
      fileHash: fileHash.substring(0, 16) + '...',
      fileName,
      propertyId,
      originalFileSize: `${(fileBytes.length / 1024 / 1024).toFixed(2)} MB`,
      hashSize: `${hashBytes.length} bytes`,
      uploadTimeMs: uploadTime,
      uploadTimeSeconds: `${(uploadTime / 1000).toFixed(2)}s`,
      transactionId: fileCreateTx.transactionId?.toString()
    });

    // Build response data object
    const responseData = {
      fileId,
      fileHash,
      transactionId: fileCreateTx.transactionId?.toString(),
    };

    // Build main response object
    const response = {
      success: true,
      data: responseData,
      message: `File hash uploaded to HFS: ${fileId}`,
      stats: {
        originalFileSize: `${(fileBytes.length / 1024 / 1024).toFixed(2)} MB`,
        hashSize: `${hashBytes.length} bytes`,
        uploadTime: `${(uploadTime / 1000).toFixed(2)}s`,
        compressionRatio: `${((fileBytes.length / hashBytes.length) / 1000).toFixed(1)}x`
      }
    };

    return new Response(
      JSON.stringify(response),
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
  } finally {
    // Clean up client connection
    if (client) {
      try {
        client.close();
        console.log(`[UPLOAD-TO-HFS] Client connection closed`);
      } catch (closeError) {
        console.warn(`[UPLOAD-TO-HFS] Warning: Error closing client:`, closeError);
      }
    }
  }
});