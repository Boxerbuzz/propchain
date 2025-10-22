import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { generateAgreementPDF, generateReceiptPDF, generateShareCertificatePDF } from "./pdf-templates.ts";

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
    const agreementContent = generateAgreementPDF({
      investment,
      kycData,
      documentNumber: agreementNumber,
      currentDate,
    });

    const receiptContent = generateReceiptPDF({
      investment,
      kycData,
      documentNumber: receiptNumber,
      currentDate,
    });

    const certificateContent = generateShareCertificatePDF({
      investment,
      kycData,
      documentNumber: certificateNumber,
      currentDate,
    });

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
        version: 1,
        version_date: new Date().toISOString(),
        is_current: true,
        metadata: {
          property_title: (investment.tokenizations as any).properties?.title,
          amount_ngn: investment.amount_ngn,
          tokens_requested: investment.tokens_requested,
          tokenization_type: (investment.tokenizations as any).tokenization_type,
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
        version: 1,
        version_date: new Date().toISOString(),
        is_current: true,
        metadata: {
          payment_method: investment.payment_method,
          payment_reference: investment.paystack_reference,
          amount_ngn: investment.amount_ngn,
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
        version: 1,
        version_date: new Date().toISOString(),
        is_current: true,
        metadata: {
          property_title: (investment.tokenizations as any).properties?.title,
          tokens_held: investment.tokens_requested,
          ownership_percentage: ((investment.tokens_requested / (investment.tokenizations as any).total_supply) * 100).toFixed(4),
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

// PDF generation functions are now imported from pdf-templates.ts
