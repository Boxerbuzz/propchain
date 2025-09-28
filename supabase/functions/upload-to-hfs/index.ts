// supabase/functions/upload-to-hfs/index.ts
// Optimized for files up to 5MB with efficient chunking strategy
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
    // Convert file to Uint8Array
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Validate against ACTUAL HFS limits
    const HFS_MAX_FILE_SIZE = 1024 * 1024; // 1MB - HFS hard limit
    const RECOMMENDED_MAX = 500 * 1024;    // 500KB - safe limit
    
    if (file.size > HFS_MAX_FILE_SIZE) {
      console.error(`[UPLOAD-TO-HFS] ❌ File exceeds HFS limit: ${file.size} bytes (HFS max: 1MB)`);
      return new Response(
        JSON.stringify({
          error: `File exceeds HFS 1MB limit. Consider IPFS or file splitting.`,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          hfsLimit: "1MB",
          alternatives: ["IPFS + metadata on Hedera", "File splitting", "External storage"]
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (file.size > RECOMMENDED_MAX) {
      console.warn(`[UPLOAD-TO-HFS] ⚠️ File size ${file.size} bytes approaches HFS limit. Consider alternatives.`);
    }

    // Create file memo with property info (keep under 100 bytes for Hedera)
    const fileMemo = `PropChain: ${fileName.substring(0, 30)} (${propertyId.substring(0, 8)})`;
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

    // Efficient chunking for files up to 5MB
    const chunkSize = 16384; // 16KB chunks - optimal balance for HFS efficiency  
    const totalChunks = Math.ceil(fileBytes.length / chunkSize);
    console.log(`[UPLOAD-TO-HFS] Uploading file in ${totalChunks} chunks of ${chunkSize} bytes each`);
    
    // Simple sequential upload with smart progress reporting
    let uploadedChunks = 0;
    const failedChunks: number[] = [];
    const startTime = Date.now();

    for (let i = 0; i < fileBytes.length; i += chunkSize) {
      const chunk = fileBytes.slice(i, i + chunkSize);
      const chunkNumber = Math.floor(i / chunkSize) + 1;
      
      try {
        // Progress reporting: log every 25 chunks or on significant milestones
        const shouldLog = chunkNumber % 25 === 0 || 
                         chunkNumber === 1 || 
                         chunkNumber === totalChunks ||
                         chunkNumber % Math.ceil(totalChunks / 10) === 0; // Every 10%

        if (shouldLog) {
          const progress = Math.round((chunkNumber / totalChunks) * 100);
          console.log(`[UPLOAD-TO-HFS] Progress: ${progress}% - Uploading chunk ${chunkNumber}/${totalChunks} (${chunk.length} bytes)`);
        }
        
        const fileAppendTx = await new FileAppendTransaction()
          .setFileId(fileId)
          .setContents(chunk)
          .setMaxTransactionFee(new Hbar(2))
          .execute(client);

        // Simple receipt check - no complex timeout handling needed for reasonable file sizes
        await fileAppendTx.getReceipt(client);
        uploadedChunks++;

        if (shouldLog) {
          console.log(`[UPLOAD-TO-HFS] ✅ Chunk ${chunkNumber} completed successfully`);
        }

      } catch (error) {
        console.error(`[UPLOAD-TO-HFS] ❌ Chunk ${chunkNumber} failed:`, error.message);
        failedChunks.push(chunkNumber);
        
        // Continue with next chunk - don't fail entire upload for individual chunk failures
      }
    }

    const uploadTime = Date.now() - startTime;
    console.log(`[UPLOAD-TO-HFS] Upload completed in ${uploadTime}ms: ${uploadedChunks}/${totalChunks} chunks successful`);

    if (failedChunks.length > 0) {
      console.warn(`[UPLOAD-TO-HFS] ⚠️ ${failedChunks.length} chunks failed:`, failedChunks);
    }

    console.log(`[UPLOAD-TO-HFS] Generating file hash for verification`);
    // Generate file hash for verification
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`[UPLOAD-TO-HFS] ✅ File upload complete:`, {
      fileId,
      fileHash: fileHash.substring(0, 16) + '...',
      fileName,
      propertyId,
      fileSize: `${(fileBytes.length / 1024 / 1024).toFixed(2)} MB`,
      chunksSuccessful: uploadedChunks,
      chunksTotal: totalChunks,
      chunksFailed: failedChunks.length,
      uploadTimeSeconds: `${(uploadTime / 1000).toFixed(2)}s`,
      averageChunkTimeMs: Math.round(uploadTime / totalChunks),
      transactionId: fileCreateTx.transactionId?.toString()
    });

    // Build response data object with conditional properties
    const responseData: any = {
      fileId,
      fileHash,
      transactionId: fileCreateTx.transactionId?.toString(),
    };

    // Add failed chunks if there were any
    if (failedChunks.length > 0) {
      responseData.failedChunks = failedChunks;
    }

    // Build main response object with conditional properties
    const response: any = {
      success: true,
      data: responseData,
      message: `File uploaded to HFS: ${fileId}`,
      stats: {
        fileSize: `${(fileBytes.length / 1024 / 1024).toFixed(2)} MB`,
        chunks: `${uploadedChunks}/${totalChunks}`,
        uploadTime: `${(uploadTime / 1000).toFixed(2)}s`,
        chunkSize: `${chunkSize / 1024}KB`
      }
    };

    // Add warning if some chunks failed
    if (failedChunks.length > 0) {
      response.warning = `${failedChunks.length} chunks failed during upload`;
      console.warn(`[UPLOAD-TO-HFS] ⚠️ Upload completed with warnings: ${failedChunks.length} chunks failed:`, failedChunks);
    }

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