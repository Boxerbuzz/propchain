import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { generateAgreementPDF, generateReceiptPDF, generateShareCertificatePDF } from "./pdf-templates.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { investment_id } = await req.json();

    if (!investment_id) {
      return new Response(
        JSON.stringify({ error: 'Investment ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching investment data for:', investment_id);

    // Fetch investment with all related data
    const { data: investment, error: investmentError } = await supabase
      .from('investments')
      .select(`
        *,
        tokenizations!inner(
          *,
          tokenization_type,
          interest_rate,
          ltv_ratio,
          loan_term_months,
          revenue_share_percentage,
          properties!inner(
            *,
            property_images(image_url, is_primary)
          )
        ),
        investor:users!investments_investor_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', investment_id)
      .single();

    if (investmentError || !investment) {
      console.error('Investment fetch error:', investmentError);
      return new Response(
        JSON.stringify({ error: 'Investment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Investment data fetched successfully');

    // Fetch KYC data for investor address
    const { data: kycData } = await supabase
      .from('kyc_verifications')
      .select('address, city, state, postal_code')
      .eq('user_id', investment.investor_id)
      .single();

    // Generate document numbers
    const agreementNumber = `AGR-${Date.now()}-${investment_id.substring(0, 8).toUpperCase()}`;
    const receiptNumber = `REC-${Date.now()}-${investment_id.substring(0, 8).toUpperCase()}`;

    // Generate document numbers
    const certificateNumber = `CERT-${Date.now()}-${investment_id.substring(0, 8).toUpperCase()}`;
    const currentDate = new Date().toLocaleString();

    // Generate PDF content using templates
    const agreementContent = await generateAgreementPDF({
      investment,
      kycData,
      documentNumber: agreementNumber,
      currentDate,
    });

    const receiptContent = await generateReceiptPDF({
      investment,
      kycData,
      documentNumber: receiptNumber,
      currentDate,
    });

    const certificateContent = await generateShareCertificatePDF({
      investment,
      kycData,
      documentNumber: certificateNumber,
      currentDate,
    });

    // Generate document hashes for blockchain verification
    const agreementHash = await generateDocumentHash(agreementContent);
    const receiptHash = await generateDocumentHash(receiptContent);
    const certificateHash = await generateDocumentHash(certificateContent);

    console.log('Document hashes generated');

    // Generate QR codes for verification
    const agreementQR = await generateQRCode(`https://propchain.com/verify/${agreementNumber}`);
    const receiptQR = await generateQRCode(`https://propchain.com/verify/${receiptNumber}`);
    const certificateQR = await generateQRCode(`https://propchain.com/verify/${certificateNumber}`);

    // Upload documents to storage
    const userId = investment.investor_id;
    const timestamp = Date.now();
    
    const agreementPath = `${userId}/agreement-${timestamp}.pdf`;
    const receiptPath = `${userId}/receipt-${timestamp}.pdf`;
    const certificatePath = `${userId}/certificate-${timestamp}.pdf`;

    // Upload agreement
    const { error: agreementUploadError } = await supabase.storage
      .from('investment-documents')
      .upload(agreementPath, agreementContent, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (agreementUploadError) {
      console.error('Agreement upload error:', agreementUploadError);
      throw new Error(`Failed to upload agreement: ${agreementUploadError.message}`);
    }

    // Upload receipt
    const { error: receiptUploadError } = await supabase.storage
      .from('investment-documents')
      .upload(receiptPath, receiptContent, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (receiptUploadError) {
      console.error('Receipt upload error:', receiptUploadError);
      throw new Error(`Failed to upload receipt: ${receiptUploadError.message}`);
    }

    // Upload certificate
    const { error: certificateUploadError } = await supabase.storage
      .from('investment-documents')
      .upload(certificatePath, certificateContent, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (certificateUploadError) {
      console.error('Certificate upload error:', certificateUploadError);
      throw new Error(`Failed to upload certificate: ${certificateUploadError.message}`);
    }

    console.log('Documents uploaded successfully');

    // Submit hashes to HCS for blockchain verification (async, don't wait)
    submitToHCS(supabase, agreementNumber, agreementHash).catch(err => 
      console.error('HCS submission failed for agreement:', err)
    );
    submitToHCS(supabase, receiptNumber, receiptHash).catch(err => 
      console.error('HCS submission failed for receipt:', err)
    );
    submitToHCS(supabase, certificateNumber, certificateHash).catch(err => 
      console.error('HCS submission failed for certificate:', err)
    );

    // Create database records with versioning support
    const documents = [
      {
        investment_id: investment_id,
        user_id: userId,
        tokenization_id: investment.tokenization_id,
        property_id: (investment.tokenizations as any).property_id,
        document_type: 'agreement',
        document_url: agreementPath,
        document_number: agreementNumber,
        document_hash: agreementHash,
        qr_code_data: agreementQR,
        version: 1,
        version_date: new Date().toISOString(),
        is_current: true,
        metadata: {
          property_title: (investment.tokenizations as any).properties?.title,
          amount_ngn: investment.amount_ngn,
          tokens_requested: investment.tokens_requested,
          tokenization_type: (investment.tokenizations as any).tokenization_type,
          investor_name: `${investor.first_name} ${investor.last_name}`,
        }
      },
      {
        investment_id: investment_id,
        user_id: userId,
        tokenization_id: investment.tokenization_id,
        property_id: (investment.tokenizations as any).property_id,
        document_type: 'receipt',
        document_url: receiptPath,
        document_number: receiptNumber,
        document_hash: receiptHash,
        qr_code_data: receiptQR,
        version: 1,
        version_date: new Date().toISOString(),
        is_current: true,
        metadata: {
          payment_method: investment.payment_method,
          payment_reference: investment.paystack_reference,
          amount_ngn: investment.amount_ngn,
          investor_name: `${investor.first_name} ${investor.last_name}`,
        }
      },
      {
        investment_id: investment_id,
        user_id: userId,
        tokenization_id: investment.tokenization_id,
        property_id: (investment.tokenizations as any).property_id,
        document_type: 'certificate',
        document_url: certificatePath,
        document_number: certificateNumber,
        document_hash: certificateHash,
        qr_code_data: certificateQR,
        version: 1,
        version_date: new Date().toISOString(),
        is_current: true,
        metadata: {
          property_title: (investment.tokenizations as any).properties?.title,
          tokens_held: investment.tokens_requested,
          ownership_percentage: ((investment.tokens_requested / (investment.tokenizations as any).total_supply) * 100).toFixed(4),
          investor_name: `${investor.first_name} ${investor.last_name}`,
        }
      }
    ];

    const { error: dbError } = await supabase
      .from('investment_documents')
      .insert(documents);

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error(`Failed to save document records: ${dbError.message}`);
    }

    // Send notification
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Investment Documents Ready',
      message: `Your investment documents (Agreement, Receipt, and Share Certificate) for ${(investment.tokenizations as any).properties?.title} are now available for download.`,
      notification_type: 'document_ready',
      priority: 'high',
      action_url: `/portfolio/${investment.tokenization_id}`,
      action_data: {
        investment_id: investment_id,
        document_count: 3,
      },
    });

    console.log('Documents generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        documents: {
          agreement: { path: agreementPath, number: agreementNumber },
          receipt: { path: receiptPath, number: receiptNumber },
          certificate: { path: certificatePath, number: certificateNumber }
        },
        message: 'Investment documents generated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating documents:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to generate document hash
async function generateDocumentHash(content: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", content);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate QR code using qrcode library
async function generateQRCode(url: string): Promise<string> {
  try {
    const QRCode = (await import('https://esm.sh/qrcode@1.5.4')).default;
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw error;
  }
}

// Helper function to submit hash to HCS
async function submitToHCS(supabase: any, documentNumber: string, hash: string): Promise<void> {
  try {
    const topicId = Deno.env.get('DOCUMENTS_HCS_TOPIC_ID') || '0.0.5260491';
    
    await supabase.functions.invoke('submit-to-hcs', {
      body: {
        topicId: topicId,
        message: JSON.stringify({
          type: 'document_hash',
          document_number: documentNumber,
          hash: hash,
          timestamp: new Date().toISOString(),
          platform: 'PropChain',
          version: '1.0'
        })
      }
    });
    
    console.log(`Document hash submitted to HCS topic ${topicId}: ${documentNumber}`);
  } catch (error) {
    console.error('HCS submission error:', error);
  }
}
