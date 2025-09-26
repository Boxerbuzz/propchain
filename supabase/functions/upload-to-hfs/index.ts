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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const propertyId = formData.get('propertyId') as string;

    if (!file || !fileName || !propertyId) {
      return new Response(
        JSON.stringify({
          error: "Missing file, fileName, or propertyId",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(
      Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!
    );
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
    client.setOperator(operatorId, operatorKey);

    // Convert file to Uint8Array
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Create file memo with property info
    const fileMemo = `PropChain Document: ${fileName} for Property ${propertyId}`;

    // Create file on HFS
    const fileCreateTx = await new FileCreateTransaction()
      .setContents("")
      .setKeys([operatorKey])
      .setFileMemo(fileMemo)
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);

    const fileCreateReceipt = await fileCreateTx.getReceipt(client);
    const fileId = fileCreateReceipt.fileId!.toString();

    // Append file contents (HFS has size limits, so we may need to chunk)
    const chunkSize = 1024; // 1KB chunks
    for (let i = 0; i < fileBytes.length; i += chunkSize) {
      const chunk = fileBytes.slice(i, i + chunkSize);
      
      const fileAppendTx = await new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(chunk)
        .setMaxTransactionFee(new Hbar(2))
        .execute(client);

      await fileAppendTx.getReceipt(client);
    }

    // Generate file hash for verification
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`File uploaded to HFS: ${fileId}, Hash: ${fileHash}`);

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
    console.error("Error uploading to HFS:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to upload to HFS",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});