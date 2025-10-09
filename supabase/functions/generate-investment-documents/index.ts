import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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

    // Generate PDF content using React-PDF templates
    const agreementContent = generateAgreementPDF({
      investment,
      kycData,
      documentNumber: agreementNumber,
    });

    const receiptContent = generateReceiptPDF({
      investment,
      kycData,
      documentNumber: receiptNumber,
    });

    // Upload documents to storage
    const userId = investment.investor_id;
    const timestamp = Date.now();
    
    const agreementPath = `${userId}/agreement-${timestamp}.pdf`;
    const receiptPath = `${userId}/receipt-${timestamp}.pdf`;

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

    console.log('Documents uploaded successfully');

    // Create database records
    const documents = [
      {
        investment_id: investment_id,
        user_id: userId,
        tokenization_id: investment.tokenization_id,
        property_id: (investment.tokenizations as any).property_id,
        document_type: 'agreement',
        document_url: agreementPath,
        document_number: agreementNumber,
        metadata: {
          property_title: (investment.tokenizations as any).properties?.title,
          amount_ngn: investment.amount_ngn,
          tokens_requested: investment.tokens_requested,
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
        metadata: {
          payment_method: investment.payment_method,
          payment_reference: investment.paystack_reference,
          amount_ngn: investment.amount_ngn,
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
      message: `Your investment agreement and receipt for ${(investment.tokenizations as any).properties?.title} are now available for download.`,
      notification_type: 'document_ready',
      action_url: `/portfolio/${investment.tokenization_id}`,
    });

    console.log('Documents generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        documents: {
          agreement: { path: agreementPath, number: agreementNumber },
          receipt: { path: receiptPath, number: receiptNumber }
        }
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

// Simple PDF generation functions (placeholder - would use @react-pdf/renderer in production)
function generateAgreementPDF(data: any): Uint8Array {
  const { investment, kycData, documentNumber } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;
  
  const tokenizationType = tokenization.tokenization_type || 'equity';
  const typeLabel = tokenizationType === 'equity' ? 'OWNERSHIP' 
    : tokenizationType === 'debt' ? 'LENDING' 
    : 'REVENUE SHARING';
  
  let typeSpecificTerms = '';
  if (tokenizationType === 'equity') {
    typeSpecificTerms = `
EQUITY OWNERSHIP TERMS:
- Ownership Share: ${((investment.tokens_requested / tokenization.total_supply) * 100).toFixed(4)}%
- Voting Rights: Proportional to token holdings
- Profit Distribution: Proportional to ownership percentage
- Capital Appreciation: Shared proportionally on property sale`;
  } else if (tokenizationType === 'debt') {
    typeSpecificTerms = `
DEBT LENDING TERMS:
- Interest Rate: ${tokenization.interest_rate || 'N/A'}% per annum
- Loan Term: ${tokenization.loan_term_months || 'N/A'} months
- LTV Ratio: ${tokenization.ltv_ratio || 'N/A'}%
- Repayment Priority: Senior debt with property collateral
- No ownership or voting rights`;
  } else {
    typeSpecificTerms = `
REVENUE SHARING TERMS:
- Revenue Share: ${tokenization.revenue_share_percentage || 'N/A'}%
- Distribution Frequency: ${tokenization.dividend_frequency || 'Quarterly'}
- Based on gross rental income
- No ownership or voting rights`;
  }
  
  const content = `
${typeLabel} INVESTMENT AGREEMENT
${documentNumber}

Bamboo Systems Technology Limited
Real Estate Tokenization Platform
Investment Type: ${typeLabel}
Generated: ${new Date().toLocaleString()}

INVESTOR INFORMATION:
Name: ${investor.first_name} ${investor.last_name}
Email: ${investor.email}
${kycData?.address ? `Address: ${kycData.address}, ${kycData.city}, ${kycData.state}` : ''}

PROPERTY DETAILS:
Title: ${property.title}
Location: ${JSON.parse(property.location).address}
Estimated Value: ₦${property.estimated_value.toLocaleString()}

INVESTMENT TERMS:
Amount Invested: ₦${investment.amount_ngn.toLocaleString()}
Tokens Allocated: ${investment.tokens_requested}
Token Symbol: ${tokenization.token_symbol}
Price per Token: ₦${tokenization.price_per_token.toLocaleString()}
Expected Annual ROI: ${tokenization.expected_roi_annual}%

${typeSpecificTerms}

This agreement is governed by the laws of the Federal Republic of Nigeria.
  `.trim();

  return new TextEncoder().encode(content);
}

function generateReceiptPDF(data: any): Uint8Array {
  const { investment, kycData, documentNumber } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;
  
  const tokenizationType = tokenization.tokenization_type || 'equity';
  const typeLabel = tokenizationType === 'equity' ? 'Ownership' 
    : tokenizationType === 'debt' ? 'Lending' 
    : 'Revenue Sharing';
  
  const content = `
INVESTMENT RECEIPT
${documentNumber}

Bamboo Systems Technology Limited
Receipt Date: ${new Date().toLocaleString()}
Investment Type: ${typeLabel}

PAYMENT DETAILS:
Receipt Number: ${documentNumber}
Transaction Reference: ${investment.paystack_reference || 'WALLET-' + investment.id.substring(0, 8)}
Payment Method: ${investment.payment_method === 'wallet' ? 'Wallet Balance' : 'Paystack'}
Amount Paid: ₦${investment.amount_ngn.toLocaleString()}
Payment Status: ${investment.payment_status}
Payment Date: ${investment.payment_confirmed_at ? new Date(investment.payment_confirmed_at).toLocaleString() : 'Pending'}

INVESTOR:
${investor.first_name} ${investor.last_name}
${investor.email}

INVESTMENT DETAILS:
Property: ${property.title}
Investment Type: ${typeLabel}
Tokens Allocated: ${investment.tokens_requested} ${tokenization.token_symbol}
Token ID: ${tokenization.token_id || 'Pending'}

This is a computer-generated receipt and does not require a signature.
  `.trim();

  return new TextEncoder().encode(content);
}
