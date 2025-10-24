import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";
import { COMPANY_INFO } from '../_shared/company-config.ts';
import {
  getEquityTerms,
  getDebtTerms,
  getRevenueShareTerms,
  getRightsAndObligations,
  getRiskDisclosures,
  getNigerianCompliance,
  getDisputeResolution,
  getGeneralProvisions,
  formatNaira,
  formatDate
} from './legal-content.ts';

interface InvestmentData {
  investment: any;
  kycData: any;
  documentNumber: string;
  currentDate: string;
}

const PRIMARY_COLOR = rgb(0.13, 0.77, 0.36); // #21c45d
const GRAY = rgb(0.4, 0.4, 0.4);
const BLACK = rgb(0, 0, 0);

/**
 * Sanitizes text for WinAnsi encoding used by pdf-lib standard fonts.
 * Replaces common Unicode characters with ASCII equivalents to prevent encoding errors.
 * 
 * @param text - The text to sanitize
 * @returns ASCII-safe text that can be rendered in PDFs
 */
function sanitizeForPDF(text: string): string {
  if (!text) return '';
  
  return text
    // Checkmarks and symbols
    .replace(/✓|✔|☑/g, '*')           // Checkmarks → asterisk
    .replace(/✗|✘|☒/g, 'x')           // X marks → x
    .replace(/•/g, '*')                // Bullet → asterisk
    .replace(/→/g, '->')               // Arrow → ASCII arrow
    .replace(/←/g, '<-')
    
    // Smart quotes and apostrophes
    .replace(/[""]/g, '"')             // Smart double quotes → regular
    .replace(/['']/g, "'")             // Smart single quotes → regular
    
    // Dashes
    .replace(/—/g, '-')                // Em dash → hyphen
    .replace(/–/g, '-')                // En dash → hyphen
    
    // Ellipsis
    .replace(/…/g, '...')              // Ellipsis → three dots
    
    // Currency symbols (keep common ones, remove others)
    .replace(/[€]/g, 'EUR')            // Euro → EUR
    .replace(/[£]/g, 'GBP')            // Pound → GBP
    .replace(/[¥]/g, 'JPY')            // Yen → JPY
    
    // Accented characters (common in Nigerian names)
    .replace(/[àáâãäå]/gi, 'a')
    .replace(/[èéêë]/gi, 'e')
    .replace(/[ìíîï]/gi, 'i')
    .replace(/[òóôõö]/gi, 'o')
    .replace(/[ùúûü]/gi, 'u')
    .replace(/[ñ]/gi, 'n')
    .replace(/[ç]/gi, 'c')
    
    // Emojis and special symbols - remove completely
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')  // Emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '')    // Miscellaneous symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')    // Dingbats
    
    // Final safety: remove ANY remaining non-ASCII characters
    .replace(/[^\x00-\x7F]/g, '')
    
    // Clean up multiple spaces and trim
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateAgreementPDF(data: InvestmentData): Promise<Uint8Array> {
  const { investment, kycData, documentNumber, currentDate } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;
  
  const tokenizationType = tokenization.tokenization_type || 'equity';
  const ownership = (investment.tokens_requested / tokenization.total_supply) * 100;

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Page 1
  let page = pdfDoc.addPage([595, 842]); // A4 size
  let yPosition = 800;

  // Header
  page.drawRectangle({
    x: 50,
    y: yPosition - 60,
    width: 495,
    height: 60,
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
  });

  page.drawText(COMPANY_INFO.name, {
    x: 60,
    y: yPosition - 30,
    size: 14,
    font: timesRomanBold,
    color: PRIMARY_COLOR,
  });

  page.drawText(`RC: ${COMPANY_INFO.rc_number}`, {
    x: 60,
    y: yPosition - 45,
    size: 8,
    font: timesRomanFont,
    color: GRAY,
  });

  page.drawText(`${COMPANY_INFO.address.city}, ${COMPANY_INFO.address.state}`, {
    x: 60,
    y: yPosition - 57,
    size: 8,
    font: timesRomanFont,
    color: GRAY,
  });

  yPosition -= 80;

  // Title
  const title = 'INVESTMENT AGREEMENT';
  const titleWidth = timesRomanBold.widthOfTextAtSize(title, 18);
  page.drawText(title, {
    x: (595 - titleWidth) / 2,
    y: yPosition,
    size: 18,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 30;

  // Document metadata
  page.drawText(`Document No: ${documentNumber} | Date: ${formatDate(currentDate)}`, {
    x: 100,
    y: yPosition,
    size: 9,
    font: timesRomanFont,
    color: GRAY,
  });

  yPosition -= 30;

  // Parties section
  page.drawText('PARTIES TO THE AGREEMENT', {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 20;

  page.drawText('BETWEEN:', {
    x: 50,
    y: yPosition,
    size: 10,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 15;

  const partyText = [
    COMPANY_INFO.name,
    `RC Number: ${COMPANY_INFO.rc_number}`,
    `Address: ${COMPANY_INFO.address.street}, ${COMPANY_INFO.address.city}`,
    '("The Platform" / "PropChain")',
    '',
    'AND',
    '',
    `${investor.first_name} ${investor.last_name}`,
    `Email: ${investor.email}`,
    kycData?.address ? `Address: ${kycData.address}, ${kycData.city}` : '',
    '("The Investor")',
  ].filter(Boolean);

  for (const line of partyText) {
    if (line === 'AND') {
      yPosition -= 5;
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: timesRomanBold,
        color: BLACK,
      });
    } else {
      page.drawText(sanitizeForPDF(line), {
        x: 50,
        y: yPosition,
        size: 9,
        font: timesRomanFont,
        color: BLACK,
      });
    }
    yPosition -= 12;
  }

  yPosition -= 10;

  // Property Details
  page.drawText('1. PROPERTY DETAILS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 20;

  const propertyLines = [
    `Property Title: ${property.title}`,
    `Property Type: ${property.property_type}`,
    `Estimated Value: ${formatNaira(property.estimated_value)}`,
    property.rental_income_monthly ? `Monthly Rental Income: ${formatNaira(property.rental_income_monthly)}` : '',
  ].filter(Boolean);

  for (const line of propertyLines) {
    page.drawText(sanitizeForPDF(line), {
      x: 50,
      y: yPosition,
      size: 9,
      font: timesRomanFont,
      color: BLACK,
    });
    yPosition -= 12;
  }

  yPosition -= 10;

  // Investment Terms
  page.drawText('2. INVESTMENT TERMS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 20;

  const investmentLines = [
    `Amount Invested: ${formatNaira(investment.amount_ngn)}`,
    `Tokens Allocated: ${investment.tokens_requested.toLocaleString()}`,
    `Token Symbol: ${tokenization.token_symbol}`,
    `Price per Token: ${formatNaira(tokenization.price_per_token)}`,
    `Ownership Percentage: ${ownership.toFixed(4)}%`,
    `Investment Date: ${formatDate(investment.created_at)}`,
  ];

  for (const line of investmentLines) {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 9,
      font: timesRomanFont,
      color: BLACK,
    });
    yPosition -= 12;
  }

  yPosition -= 10;

  // Get specific terms
  let specificTerms = '';
  if (tokenizationType === 'equity') {
    specificTerms = getEquityTerms(ownership);
  } else if (tokenizationType === 'debt') {
    specificTerms = getDebtTerms(tokenization.interest_rate || 10, tokenization.loan_term_months || 12);
  } else {
    specificTerms = getRevenueShareTerms(tokenization.revenue_share_percentage || 5, 12);
  }

  // Add specific terms (truncated for first page)
  const termsLines = specificTerms.split('\n').slice(0, 15);
  for (const line of termsLines) {
    if (yPosition < 100) break;
    page.drawText(sanitizeForPDF(line.substring(0, 80)), {
      x: 50,
      y: yPosition,
      size: 8,
      font: timesRomanFont,
      color: BLACK,
    });
    yPosition -= 10;
  }

  // Footer
  page.drawLine({
    start: { x: 50, y: 50 },
    end: { x: 545, y: 50 },
    thickness: 1,
    color: GRAY,
  });

  page.drawText(`Document ID: ${documentNumber} | ${COMPANY_INFO.contact.website}`, {
    x: 150,
    y: 35,
    size: 8,
    font: timesRomanFont,
    color: GRAY,
  });

  // Page 2 - Legal content
  page = pdfDoc.addPage([595, 842]);
  yPosition = 800;

  // Header (repeated)
  page.drawText(COMPANY_INFO.name, {
    x: 50,
    y: yPosition,
    size: 10,
    font: timesRomanBold,
    color: PRIMARY_COLOR,
  });

  page.drawLine({
    start: { x: 50, y: yPosition - 5 },
    end: { x: 545, y: yPosition - 5 },
    thickness: 1,
    color: PRIMARY_COLOR,
  });

  yPosition -= 25;

  // Risk Disclosures
  page.drawText('RISK DISCLOSURE STATEMENT', {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 20;

  const riskLines = getRiskDisclosures().split('\n').filter(l => l.trim()).slice(0, 40);
  for (const line of riskLines) {
    if (yPosition < 100) break;
    const trimmedLine = line.trim().substring(0, 90);
    page.drawText(sanitizeForPDF(trimmedLine), {
      x: 50,
      y: yPosition,
      size: 8,
      font: timesRomanFont,
      color: BLACK,
    });
    yPosition -= 10;
  }

  // Footer
  page.drawLine({
    start: { x: 50, y: 50 },
    end: { x: 545, y: 50 },
    thickness: 1,
    color: GRAY,
  });

  page.drawText('Page 2', {
    x: 280,
    y: 35,
    size: 8,
    font: timesRomanFont,
    color: GRAY,
  });

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function generateReceiptPDF(data: InvestmentData): Promise<Uint8Array> {
  const { investment, kycData, documentNumber, currentDate } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([595, 842]);
  let yPosition = 800;

  // Header
  page.drawRectangle({
    x: 50,
    y: yPosition - 60,
    width: 495,
    height: 60,
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
  });

  page.drawText(COMPANY_INFO.name, {
    x: 60,
    y: yPosition - 30,
    size: 14,
    font: timesRomanBold,
    color: PRIMARY_COLOR,
  });

  yPosition -= 80;

  // Title
  const title = 'INVESTMENT RECEIPT';
  const titleWidth = timesRomanBold.widthOfTextAtSize(title, 18);
  page.drawText(title, {
    x: (595 - titleWidth) / 2,
    y: yPosition,
    size: 18,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 30;

  page.drawText(`Receipt No: ${documentNumber} | Date: ${formatDate(currentDate)}`, {
    x: 150,
    y: yPosition,
    size: 9,
    font: timesRomanFont,
    color: GRAY,
  });

  yPosition -= 40;

  // Payment Details
  page.drawText('PAYMENT DETAILS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 20;

  const paymentLines = [
    `Transaction Reference: ${investment.paystack_reference || 'WALLET-' + investment.id.substring(0, 8)}`,
    `Payment Method: ${investment.payment_method === 'wallet' ? 'Wallet Balance' : 'Card/Bank'}`,
    `Payment Status: ${investment.payment_status.toUpperCase()}`,
    `Payment Date: ${investment.payment_confirmed_at ? formatDate(investment.payment_confirmed_at) : 'Pending'}`,
  ];

  for (const line of paymentLines) {
    page.drawText(sanitizeForPDF(line), {
      x: 50,
      y: yPosition,
      size: 9,
      font: timesRomanFont,
      color: BLACK,
    });
    yPosition -= 14;
  }

  yPosition -= 20;

  // Investment Details
  page.drawText('INVESTMENT DETAILS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 20;

  const detailLines = [
    `Property: ${property.title}`,
    `Tokens: ${investment.tokens_requested.toLocaleString()} ${tokenization.token_symbol}`,
    `Price per Token: ${formatNaira(tokenization.price_per_token)}`,
    `Ownership: ${((investment.tokens_requested / tokenization.total_supply) * 100).toFixed(4)}%`,
  ];

  for (const line of detailLines) {
    page.drawText(sanitizeForPDF(line), {
      x: 50,
      y: yPosition,
      size: 9,
      font: timesRomanFont,
      color: BLACK,
    });
    yPosition -= 14;
  }

  yPosition -= 20;

  // Financial Breakdown
  page.drawText('FINANCIAL BREAKDOWN', {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 20;

  page.drawText('Investment Amount:', {
    x: 50,
    y: yPosition,
    size: 9,
    font: timesRomanFont,
    color: BLACK,
  });

  page.drawText(formatNaira(investment.amount_ngn), {
    x: 400,
    y: yPosition,
    size: 9,
    font: timesRomanFont,
    color: BLACK,
  });

  yPosition -= 14;

  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 2,
    color: PRIMARY_COLOR,
  });

  yPosition -= 10;

  page.drawText('TOTAL PAID:', {
    x: 50,
    y: yPosition,
    size: 10,
    font: timesRomanBold,
    color: BLACK,
  });

  page.drawText(formatNaira(investment.amount_ngn), {
    x: 400,
    y: yPosition,
    size: 10,
    font: timesRomanBold,
    color: BLACK,
  });

  // Footer
  page.drawLine({
    start: { x: 50, y: 50 },
    end: { x: 545, y: 50 },
    thickness: 1,
    color: GRAY,
  });

  page.drawText(`Document ID: ${documentNumber}`, {
    x: 230,
    y: 35,
    size: 8,
    font: timesRomanFont,
    color: GRAY,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function generateShareCertificatePDF(data: InvestmentData): Promise<Uint8Array> {
  const { investment, kycData, documentNumber, currentDate } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;
  const ownership = (investment.tokens_requested / tokenization.total_supply) * 100;

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([595, 842]);
  let yPosition = 750;

  // Decorative border
  page.drawRectangle({
    x: 40,
    y: 100,
    width: 515,
    height: 650,
    borderColor: PRIMARY_COLOR,
    borderWidth: 3,
  });

  page.drawRectangle({
    x: 50,
    y: 110,
    width: 495,
    height: 630,
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
  });

  // Title
  const title = 'CERTIFICATE OF TOKEN OWNERSHIP';
  const titleWidth = timesRomanBold.widthOfTextAtSize(title, 20);
  page.drawText(title, {
    x: (595 - titleWidth) / 2,
    y: yPosition,
    size: 20,
    font: timesRomanBold,
    color: PRIMARY_COLOR,
  });

  yPosition -= 30;

  // Certificate number
  const certNum = `Certificate No: ${documentNumber}`;
  const certNumWidth = timesRomanFont.widthOfTextAtSize(certNum, 10);
  page.drawText(certNum, {
    x: (595 - certNumWidth) / 2,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
    color: GRAY,
  });

  yPosition -= 50;

  // Certificate text
  const certifyText = 'THIS IS TO CERTIFY THAT';
  const certifyWidth = timesRomanFont.widthOfTextAtSize(certifyText, 12);
  page.drawText(certifyText, {
    x: (595 - certifyWidth) / 2,
    y: yPosition,
    size: 12,
    font: timesRomanFont,
    color: BLACK,
  });

  yPosition -= 30;

  // Investor name
  const investorName = sanitizeForPDF(`${investor.first_name} ${investor.last_name}`);
  const nameWidth = timesRomanBold.widthOfTextAtSize(investorName, 16);
  page.drawText(investorName, {
    x: (595 - nameWidth) / 2,
    y: yPosition,
    size: 16,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 40;

  const holderText = 'is the registered holder of';
  const holderWidth = timesRomanFont.widthOfTextAtSize(holderText, 12);
  page.drawText(holderText, {
    x: (595 - holderWidth) / 2,
    y: yPosition,
    size: 12,
    font: timesRomanFont,
    color: BLACK,
  });

  yPosition -= 30;

  // Token amount
  const tokenText = `${investment.tokens_requested.toLocaleString()} Digital Tokens`;
  const tokenWidth = timesRomanBold.widthOfTextAtSize(tokenText, 18);
  page.drawText(tokenText, {
    x: (595 - tokenWidth) / 2,
    y: yPosition,
    size: 18,
    font: timesRomanBold,
    color: PRIMARY_COLOR,
  });

  yPosition -= 30;

  const symbolText = `Token Symbol: ${tokenization.token_symbol}`;
  const symbolWidth = timesRomanFont.widthOfTextAtSize(symbolText, 10);
  page.drawText(symbolText, {
    x: (595 - symbolWidth) / 2,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
    color: BLACK,
  });

  yPosition -= 40;

  const repText = 'representing fractional ownership in the property located at:';
  const repWidth = timesRomanFont.widthOfTextAtSize(repText, 10);
  page.drawText(repText, {
    x: (595 - repWidth) / 2,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
    color: BLACK,
  });

  yPosition -= 25;

  const propTitle = sanitizeForPDF(property.title.substring(0, 50));
  const propWidth = timesRomanBold.widthOfTextAtSize(propTitle, 12);
  page.drawText(propTitle, {
    x: (595 - propWidth) / 2,
    y: yPosition,
    size: 12,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 30;

  const ownerText = `Ownership: ${ownership.toFixed(4)}% | Value: ${formatNaira(property.estimated_value)}`;
  const ownerWidth = timesRomanFont.widthOfTextAtSize(ownerText, 9);
  page.drawText(ownerText, {
    x: (595 - ownerWidth) / 2,
    y: yPosition,
    size: 9,
    font: timesRomanFont,
    color: BLACK,
  });

  yPosition -= 60;

  // Rights
  page.drawText('Token Holding Rights:', {
    x: 80,
    y: yPosition,
    size: 10,
    font: timesRomanBold,
    color: BLACK,
  });

  yPosition -= 15;

  const rights = [
    '* Receive proportional dividends/income',
    '* Vote on governance proposals',
    '* Transfer tokens (subject to terms)',
    '* Access property information',
  ];

  for (const right of rights) {
    page.drawText(right, {
      x: 80,
      y: yPosition,
      size: 9,
      font: timesRomanFont,
      color: BLACK,
    });
    yPosition -= 14;
  }

  // Signature line
  yPosition = 180;

  page.drawLine({
    start: { x: 220, y: yPosition },
    end: { x: 375, y: yPosition },
    thickness: 1,
    color: BLACK,
  });

  yPosition -= 12;

  const sigText = COMPANY_INFO.name;
  const sigWidth = timesRomanFont.widthOfTextAtSize(sigText, 9);
  page.drawText(sigText, {
    x: (595 - sigWidth) / 2,
    y: yPosition,
    size: 9,
    font: timesRomanFont,
    color: BLACK,
  });

  yPosition -= 12;

  const authText = 'Authorized Signatory';
  const authWidth = timesRomanFont.widthOfTextAtSize(authText, 8);
  page.drawText(authText, {
    x: (595 - authWidth) / 2,
    y: yPosition,
    size: 8,
    font: timesRomanFont,
    color: GRAY,
  });

  yPosition -= 12;

  const dateText = `Date: ${formatDate(currentDate)}`;
  const dateWidth = timesRomanFont.widthOfTextAtSize(dateText, 8);
  page.drawText(dateText, {
    x: (595 - dateWidth) / 2,
    y: yPosition,
    size: 8,
    font: timesRomanFont,
    color: GRAY,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
