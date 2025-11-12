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

    // Extract property-specific HCS topic ID
    const propertyTopicId = (investment.tokenizations as any)?.properties?.hcs_topic_id;
    if (!propertyTopicId) {
      console.warn('[GENERATE-DOCS] ⚠️ Property has no HCS topic ID, documents will not be submitted to HCS');
    }

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
    const agreementQR = await generateQRCode(`https://invest.relett.com/verify/${agreementNumber}`);
    const receiptQR = await generateQRCode(`https://invest.relett.com/verify/${receiptNumber}`);
    const certificateQR = await generateQRCode(`https://invest.relett.com/verify/${certificateNumber}`);

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

    // Submit hashes to HCS for blockchain verification and capture sequence numbers
    let agreementHcsId = null;
    let receiptHcsId = null;
    let certificateHcsId = null;

    if (propertyTopicId) {
      try {
        const agreementHcs = await submitToHCS(supabase, propertyTopicId, agreementNumber, agreementHash);
        agreementHcsId = agreementHcs?.data?.sequenceNumber || agreementHcs?.sequenceNumber;
        console.log('Agreement submitted to HCS:', agreementHcsId);
      } catch (err) {
        console.error('HCS submission failed for agreement:', err);
      }

      try {
        const receiptHcs = await submitToHCS(supabase, propertyTopicId, receiptNumber, receiptHash);
        receiptHcsId = receiptHcs?.data?.sequenceNumber || receiptHcs?.sequenceNumber;
        console.log('Receipt submitted to HCS:', receiptHcsId);
      } catch (err) {
        console.error('HCS submission failed for receipt:', err);
      }

      try {
        const certificateHcs = await submitToHCS(supabase, propertyTopicId, certificateNumber, certificateHash);
        certificateHcsId = certificateHcs?.data?.sequenceNumber || certificateHcs?.sequenceNumber;
        console.log('Certificate submitted to HCS:', certificateHcsId);
      } catch (err) {
        console.error('HCS submission failed for certificate:', err);
      }
    }

    // Check for existing certificate to implement versioning
    const { data: existingCert } = await supabase
      .from('investment_documents')
      .select('id, version')
      .eq('user_id', userId)
      .eq('tokenization_id', investment.tokenization_id)
      .eq('document_type', 'certificate')
      .eq('is_current', true)
      .maybeSingle();

    let certificateVersion = 1;
    let supersededCertId = null;

    if (existingCert) {
      // Mark old certificate as superseded
      certificateVersion = existingCert.version + 1;
      supersededCertId = existingCert.id;
      
      await supabase
        .from('investment_documents')
        .update({ is_current: false })
        .eq('id', existingCert.id);
    }

    // Calculate cumulative tokens for certificate
    const { data: allInvestments } = await supabase
      .from('investments')
      .select('tokens_requested')
      .eq('investor_id', userId)
      .eq('tokenization_id', investment.tokenization_id)
      .in('payment_status', ['confirmed', 'tokens_distributed']);
    
    const cumulativeTokens = allInvestments?.reduce((sum, inv) => sum + inv.tokens_requested, 0) || investment.tokens_requested;

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
        hcs_verification_id: agreementHcsId,
        version: 1,
        version_date: new Date().toISOString(),
        is_current: true,
        metadata: {
          property_title: (investment.tokenizations as any).properties?.title,
          amount_ngn: investment.amount_ngn,
          tokens_requested: investment.tokens_requested,
          tokenization_type: (investment.tokenizations as any).tokenization_type,
          investor_name: `${investment.investor.first_name} ${investment.investor.last_name}`,
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
        hcs_verification_id: receiptHcsId,
        version: 1,
        version_date: new Date().toISOString(),
        is_current: true,
        metadata: {
          payment_method: investment.payment_method,
          payment_reference: investment.paystack_reference,
          amount_ngn: investment.amount_ngn,
          investor_name: `${investment.investor.first_name} ${investment.investor.last_name}`,
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
        hcs_verification_id: certificateHcsId,
        version: certificateVersion,
        version_date: new Date().toISOString(),
        is_current: true,
        superseded_by: null,
        reason_for_update: certificateVersion > 1 ? 'Additional investment - updated token holdings' : null,
        metadata: {
          property_title: (investment.tokenizations as any).properties?.title,
          tokens_held: cumulativeTokens,
          ownership_percentage: ((cumulativeTokens / (investment.tokenizations as any).total_supply) * 100).toFixed(4),
          investor_name: `${investment.investor.first_name} ${investment.investor.last_name}`,
          previous_version: supersededCertId,
          is_recurring_investment: certificateVersion > 1
        }
      }
    ];

    // Update superseded certificate with new certificate reference
    if (supersededCertId) {
      const newCertId = documents[2].investment_id; // Will be replaced with actual ID after insert
      // This will be updated after we get the new cert ID
    }

    const { data: insertedDocs, error: dbError } = await supabase
      .from('investment_documents')
      .insert(documents)
      .select('id, document_type');

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error(`Failed to save document records: ${dbError.message}`);
    }

    // Update superseded certificate reference
    if (supersededCertId && insertedDocs) {
      const newCert = insertedDocs.find(d => d.document_type === 'certificate');
      if (newCert) {
        await supabase
          .from('investment_documents')
          .update({ superseded_by: newCert.id })
          .eq('id', supersededCertId);
      }
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

// Generate QR code using external API service (works in Deno)
async function generateQRCode(url: string): Promise<string> {
  try {
    // Use qrserver.com API to generate QR code as PNG
    const encodedUrl = encodeURIComponent(url);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}&format=png&ecc=H&margin=10`;
    
    console.log('Generating QR code for URL:', url);
    
    // Fetch the QR code image and convert to base64 data URL
    const response = await fetch(qrUrl);
    if (!response.ok) {
      throw new Error(`QR API returned ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('QR code generated successfully');
    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw error;
  }
}

// Helper function to submit hash to HCS
async function submitToHCS(supabase: any, topicId: string | null, documentNumber: string, hash: string): Promise<any> {
  try {
    if (!topicId) {
      console.warn('[SUBMIT-TO-HCS] ⚠️ No HCS topicId provided for', documentNumber);
      return null;
    }
    
    const { data, error } = await supabase.functions.invoke('submit-to-hcs', {
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

    if (error) {
      console.error('HCS submission error:', error);
      return null;
    }
    
    console.log(`Document hash submitted to HCS topic ${topicId}: ${documentNumber}`, data);
    return data;
  } catch (error) {
    console.error('HCS submission exception:', error);
    return null;
  }
}
