// PDF Template Generators using plain text (will be replaced with @react-pdf/renderer in production)

interface InvestmentData {
  investment: any;
  kycData: any;
  documentNumber: string;
  currentDate: string;
}

export function generateAgreementPDF(data: InvestmentData): Uint8Array {
  const { investment, kycData, documentNumber, currentDate } = data;
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EQUITY OWNERSHIP TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Ownership Share: ${((investment.tokens_requested / tokenization.total_supply) * 100).toFixed(4)}%
• Voting Rights: Proportional to token holdings
• Profit Distribution: Proportional to ownership percentage  
• Capital Appreciation: Shared proportionally on property sale
• Property Management: Rights to vote on major decisions
• Exit Strategy: Tokens are transferable subject to platform rules`;
  } else if (tokenizationType === 'debt') {
    typeSpecificTerms = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEBT LENDING TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Interest Rate: ${tokenization.interest_rate || 'N/A'}% per annum
• Loan Term: ${tokenization.loan_term_months || 'N/A'} months
• LTV Ratio: ${tokenization.ltv_ratio || 'N/A'}%
• Repayment Priority: Senior debt with property collateral
• Payment Schedule: ${tokenization.dividend_frequency || 'Monthly'}
• No ownership or voting rights
• Principal repayment at loan maturity`;
  } else {
    typeSpecificTerms = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVENUE SHARING TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Revenue Share: ${tokenization.revenue_share_percentage || 'N/A'}%
• Distribution Frequency: ${tokenization.dividend_frequency || 'Quarterly'}
• Based on gross rental income
• No ownership or voting rights
• Duration: Until property sale or agreement termination`;
  }
  
  const location = typeof property.location === 'string' 
    ? JSON.parse(property.location) 
    : property.location;
  
  const content = `
╔══════════════════════════════════════════════════════════════════════╗
║                   ${typeLabel} INVESTMENT AGREEMENT                     ║
║                                                                      ║
║               BAMBOO SYSTEMS TECHNOLOGY LIMITED                      ║
║            Real Estate Tokenization Platform                         ║
╚══════════════════════════════════════════════════════════════════════╝

Document Number: ${documentNumber}
Generated: ${currentDate}
Investment Type: ${typeLabel}
Document Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTIES TO THE AGREEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLATFORM (Issuer):
  Bamboo Systems Technology Limited
  RC Number: [To be inserted]
  Address: Lagos, Nigeria
  
INVESTOR (Token Holder):
  Name: ${investor.first_name} ${investor.last_name}
  Email: ${investor.email}
  Phone: ${investor.phone || 'N/A'}
  ${kycData?.address ? `Address: ${kycData.address}, ${kycData.city}, ${kycData.state} ${kycData.postal_code || ''}` : 'Address: As per KYC records'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPERTY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Property Title: ${property.title}
Location: ${location.address || 'N/A'}
City: ${location.city || 'N/A'}, State: ${location.state || 'N/A'}
Property Type: ${property.property_type}
${property.property_subtype ? `Property Subtype: ${property.property_subtype}` : ''}
Estimated Value: ₦${property.estimated_value.toLocaleString()}
${property.rental_income_monthly ? `Monthly Rental Income: ₦${property.rental_income_monthly.toLocaleString()}` : ''}
${property.rental_yield ? `Rental Yield: ${property.rental_yield}% per annum` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVESTMENT TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Amount Invested: ₦${investment.amount_ngn.toLocaleString()}
${investment.amount_usd ? `(Approximately $${investment.amount_usd.toLocaleString()} USD)` : ''}
Tokens Allocated: ${investment.tokens_requested.toLocaleString()}
Token Symbol: ${tokenization.token_symbol}
Token ID (Hedera): ${tokenization.token_id || 'Pending creation'}
Price per Token: ₦${tokenization.price_per_token.toLocaleString()}
Expected Annual ROI: ${tokenization.expected_roi_annual}%
Investment Date: ${new Date(investment.created_at).toLocaleDateString()}
Payment Confirmed: ${new Date(investment.payment_confirmed_at).toLocaleDateString()}

${typeSpecificTerms}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERAL TERMS AND CONDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. TOKEN REPRESENTATION
   The tokens represent ${tokenizationType === 'equity' ? 'fractional ownership' : tokenizationType === 'debt' ? 'debt instruments' : 'revenue sharing rights'} 
   in the property described above, recorded on the Hedera blockchain.

2. RIGHTS AND OBLIGATIONS
   • Investor has the right to receive ${tokenizationType === 'equity' ? 'proportional dividends' : tokenizationType === 'debt' ? 'fixed interest payments' : 'revenue shares'}
   • Platform will manage the property and distribute returns as agreed
   ${tokenizationType === 'equity' ? '• Investor may participate in governance decisions through voting' : ''}
   • Investor must maintain KYC compliance throughout the investment period

3. DIVIDEND/PAYMENT DISTRIBUTION
   • Frequency: ${tokenization.dividend_frequency || 'As declared'}
   • Payment Method: Direct to investor wallet
   • Tax withholding will be applied as per Nigerian law

4. TRANSFERABILITY
   • Tokens are transferable on the platform marketplace
   • All transfers must comply with KYC/AML requirements
   • Platform reserves right to restrict transfers if required by law

5. RISK DISCLOSURE
   The investor acknowledges that:
   • Real estate investments carry market risk
   • Returns are not guaranteed
   • Property value may fluctuate
   • Liquidity may be limited
   • Regulatory changes may affect the investment

6. TERMINATION AND EXIT
   • ${tokenizationType === 'equity' ? 'Investment continues until property sale or token transfer' : ''}
   • ${tokenizationType === 'debt' ? 'Debt matures after ' + (tokenization.loan_term_months || 'N/A') + ' months' : ''}
   • Investor may sell tokens on secondary market (subject to availability)

7. GOVERNING LAW
   This agreement is governed by the laws of the Federal Republic of Nigeria.
   Disputes shall be resolved through arbitration in Lagos, Nigeria.

8. REGULATORY COMPLIANCE
   This investment is made in accordance with:
   • Securities and Exchange Commission (SEC) Nigeria regulations
   • Nigeria Data Protection Commission (NDPC) guidelines
   • Financial Action Task Force (FATF) recommendations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACKNOWLEDGMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By accepting this investment, the investor acknowledges that they have:
✓ Read and understood the terms of this agreement
✓ Reviewed the property details and risk disclosures
✓ Completed KYC verification
✓ Confirmed the investment details are accurate
✓ Agreed to the platform's Terms of Service

This is a digitally generated document and does not require physical signatures.
The investment is recorded on the blockchain with transaction ID: ${investment.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOR PLATFORM USE ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document Hash: [To be computed]
Blockchain Record: ${tokenization.hcs_topic_id || 'Pending'}
Verification URL: https://verify.bamboo.ng/doc/${documentNumber}

═══════════════════════════════════════════════════════════════════════
                    END OF INVESTMENT AGREEMENT
═══════════════════════════════════════════════════════════════════════
`;
  
  return new TextEncoder().encode(content.trim());
}

export function generateReceiptPDF(data: InvestmentData): Uint8Array {
  const { investment, kycData, documentNumber, currentDate } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;
  
  const tokenizationType = tokenization.tokenization_type || 'equity';
  const typeLabel = tokenizationType === 'equity' ? 'Ownership' 
    : tokenizationType === 'debt' ? 'Lending' 
    : 'Revenue Sharing';
  
  const content = `
╔══════════════════════════════════════════════════════════════════════╗
║                      INVESTMENT RECEIPT                              ║
║                                                                      ║
║               BAMBOO SYSTEMS TECHNOLOGY LIMITED                      ║
║            Real Estate Tokenization Platform                         ║
╚══════════════════════════════════════════════════════════════════════╝

Receipt Number: ${documentNumber}
Receipt Date: ${currentDate}
Investment Type: ${typeLabel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt Number: ${documentNumber}
Transaction Reference: ${investment.paystack_reference || 'WALLET-' + investment.id.substring(0, 8)}
Payment Method: ${investment.payment_method === 'wallet' ? 'Wallet Balance' : 'Paystack (Card/Bank)'}
Payment Status: ${investment.payment_status.toUpperCase()}
Payment Date: ${investment.payment_confirmed_at ? new Date(investment.payment_confirmed_at).toLocaleString() : 'Pending'}

Amount Paid: ₦${investment.amount_ngn.toLocaleString()}
${investment.amount_usd ? `Amount (USD): $${investment.amount_usd.toLocaleString()}` : ''}
${investment.exchange_rate ? `Exchange Rate: ₦${investment.exchange_rate}/USD` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVESTOR INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${investor.first_name} ${investor.last_name}
Email: ${investor.email}
${investor.phone ? `Phone: ${investor.phone}` : ''}
Investor ID: ${investment.investor_id.substring(0, 8).toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVESTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Property: ${property.title}
Investment Type: ${typeLabel}
Tokens Allocated: ${investment.tokens_requested.toLocaleString()} ${tokenization.token_symbol}
Token ID: ${tokenization.token_id || 'Pending creation'}
Price per Token: ₦${tokenization.price_per_token.toLocaleString()}
Ownership Percentage: ${((investment.tokens_requested / tokenization.total_supply) * 100).toFixed(4)}%

Expected Annual Returns: ${tokenization.expected_roi_annual}%
Distribution Frequency: ${tokenization.dividend_frequency || 'As declared'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Investment Amount:                    ₦${investment.amount_ngn.toLocaleString()}
Platform Fee:                         ₦0.00
Total Paid:                           ₦${investment.amount_ngn.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• This receipt confirms your payment and token allocation
• Tokens are recorded on the Hedera blockchain
• You can view your investment in your portfolio dashboard
• Access governance voting through the investor chat room
• ${tokenizationType === 'equity' ? 'Dividends will be distributed according to your ownership percentage' : ''}
• ${tokenizationType === 'debt' ? 'Interest payments will be made according to the payment schedule' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document Hash: [To be computed]
Blockchain Record: ${investment.id}
Verify at: https://verify.bamboo.ng/receipt/${documentNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bamboo Systems Technology Limited
Email: support@bamboo.ng
Phone: +234 XXX XXX XXXX
Website: https://bamboo.ng

For inquiries about this investment, please quote: ${documentNumber}

This is a computer-generated receipt and does not require a physical signature.
Generated on: ${currentDate}

═══════════════════════════════════════════════════════════════════════
                         END OF RECEIPT
═══════════════════════════════════════════════════════════════════════
`;
  
  return new TextEncoder().encode(content.trim());
}

export function generateShareCertificatePDF(data: InvestmentData): Uint8Array {
  const { investment, kycData, documentNumber, currentDate } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;
  
  const ownershipPercentage = ((investment.tokens_requested / tokenization.total_supply) * 100).toFixed(4);
  
  const content = `
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                    SHARE CERTIFICATE                                 ║
║                                                                      ║
║              BAMBOO SYSTEMS TECHNOLOGY LIMITED                       ║
║           Real Estate Tokenization Platform                          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

                    ━━━━━━━━━━━━━━━━━━━━━━
                       OFFICIAL DOCUMENT
                    ━━━━━━━━━━━━━━━━━━━━━━

Certificate Number: ${documentNumber}
Issue Date: ${currentDate}
Token ID (Hedera): ${tokenization.token_id || 'Pending'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THIS IS TO CERTIFY THAT

    ${investor.first_name.toUpperCase()} ${investor.last_name.toUpperCase()}

IS THE REGISTERED HOLDER OF

    ${investment.tokens_requested.toLocaleString()} TOKENS
    (${ownershipPercentage}% ownership)

IN THE PROPERTY KNOWN AS

    ${property.title.toUpperCase()}

REPRESENTED BY THE TOKEN SYMBOL

    ${tokenization.token_symbol}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPERTY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Property: ${property.title}
Type: ${property.property_type}
Estimated Value: ₦${property.estimated_value.toLocaleString()}
Total Supply: ${tokenization.total_supply.toLocaleString()} tokens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOLDER RIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Proportional dividend rights
✓ Voting rights on property decisions
✓ Share in capital appreciation
✓ Transferable subject to platform rules
✓ Access to property information and updates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This certificate is issued as proof of ownership and is recorded on
the Hedera blockchain for immutability and transparency.

Issued under the authority of Bamboo Systems Technology Limited

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[DIGITAL SIGNATURE PLACEHOLDER]
Platform Administrator

═══════════════════════════════════════════════════════════════════════
                      END OF SHARE CERTIFICATE
═══════════════════════════════════════════════════════════════════════
`;
  
  return new TextEncoder().encode(content.trim());
}
