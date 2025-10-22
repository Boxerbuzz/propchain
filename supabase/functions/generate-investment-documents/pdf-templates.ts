/** @jsx h */
import { h } from "https://esm.sh/preact@10.11.3";
import { render } from "https://esm.sh/preact-render-to-string@5.2.6";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  Image, 
  StyleSheet,
  renderToBuffer
} from "https://esm.sh/@react-pdf/renderer@4.3.1";
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

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    lineHeight: 1.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2px solid #21c45d',
  },
  logo: {
    width: 50,
    height: 50,
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#21c45d',
    marginBottom: 4,
  },
  watermark: {
    position: 'absolute',
    fontSize: 70,
    color: 'rgba(33, 196, 93, 0.08)',
    transform: 'rotate(-45deg)',
    top: '45%',
    left: '15%',
    fontWeight: 'bold',
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  documentMeta: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666',
  },
  section: {
    marginBottom: 15,
  },
  heading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    color: '#1a1a1a',
  },
  subheading: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333333',
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    color: '#1a1a1a',
  },
  bold: {
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e0e0e0',
    paddingVertical: 6,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666666',
    paddingTop: 10,
    borderTop: '1px solid #e0e0e0',
    textAlign: 'center',
  },
});

// Document Header Component
const DocumentHeader = ({ documentType, documentNumber, date }: any) => (
  <View style={styles.header}>
    <View style={styles.companyInfo}>
      <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
      <Text>RC: {COMPANY_INFO.rc_number}</Text>
      <Text>{COMPANY_INFO.address.street}</Text>
      <Text>{COMPANY_INFO.address.city}, {COMPANY_INFO.address.state}</Text>
      <Text>{COMPANY_INFO.contact.email}</Text>
    </View>
  </View>
);

// Watermark Component
const Watermark = ({ text }: { text: string }) => (
  <Text style={styles.watermark} fixed>{text}</Text>
);

// Footer Component
const DocumentFooter = ({ documentId }: { documentId: string }) => (
  <View style={styles.footer} fixed>
    <Text>Document ID: {documentId} | {COMPANY_INFO.contact.website} | Verify at: propchain.com/verify/{documentId}</Text>
  </View>
);

export async function generateAgreementPDF(data: InvestmentData): Promise<Uint8Array> {
  const { investment, kycData, documentNumber, currentDate } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;
  
  const tokenizationType = tokenization.tokenization_type || 'equity';
  const ownership = (investment.tokens_requested / tokenization.total_supply) * 100;
  
  // Get appropriate terms based on tokenization type
  let specificTerms = '';
  if (tokenizationType === 'equity') {
    specificTerms = getEquityTerms(ownership);
  } else if (tokenizationType === 'debt') {
    specificTerms = getDebtTerms(tokenization.interest_rate || 10, tokenization.loan_term_months || 12);
  } else {
    specificTerms = getRevenueShareTerms(tokenization.revenue_share_percentage || 5, 12);
  }

  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Watermark text="ORIGINAL" />
        <DocumentHeader 
          documentType="Investment Agreement" 
          documentNumber={documentNumber} 
          date={currentDate} 
        />
        
        <Text style={styles.documentTitle}>INVESTMENT AGREEMENT</Text>
        <Text style={styles.documentMeta}>
          Document No: {documentNumber} | Date: {formatDate(currentDate)} | Type: {tokenizationType.toUpperCase()}
        </Text>

        <View style={styles.section}>
          <Text style={styles.heading}>PARTIES TO THE AGREEMENT</Text>
          <Text style={styles.bold}>BETWEEN:</Text>
          <Text style={styles.text}>{COMPANY_INFO.name}</Text>
          <Text style={styles.text}>RC Number: {COMPANY_INFO.rc_number}</Text>
          <Text style={styles.text}>Address: {COMPANY_INFO.address.street}, {COMPANY_INFO.address.city}</Text>
          <Text style={styles.text}>("The Platform" / "PropChain")</Text>
          
          <Text style={[styles.bold, { marginTop: 10 }]}>AND</Text>
          <Text style={styles.text}>{investor.first_name} {investor.last_name}</Text>
          <Text style={styles.text}>Email: {investor.email}</Text>
          {kycData?.address && <Text style={styles.text}>Address: {kycData.address}, {kycData.city}, {kycData.state}</Text>}
          <Text style={styles.text}>("The Investor")</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>1. PROPERTY DETAILS</Text>
          <Text style={styles.text}>Property Title: {property.title}</Text>
          <Text style={styles.text}>Property Type: {property.property_type}</Text>
          <Text style={styles.text}>Estimated Value: {formatNaira(property.estimated_value)}</Text>
          {property.rental_income_monthly && (
            <Text style={styles.text}>Monthly Rental Income: {formatNaira(property.rental_income_monthly)}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. INVESTMENT TERMS</Text>
          <Text style={styles.text}>Amount Invested: {formatNaira(investment.amount_ngn)}</Text>
          <Text style={styles.text}>Tokens Allocated: {investment.tokens_requested.toLocaleString()}</Text>
          <Text style={styles.text}>Token Symbol: {tokenization.token_symbol}</Text>
          <Text style={styles.text}>Price per Token: {formatNaira(tokenization.price_per_token)}</Text>
          <Text style={styles.text}>Ownership Percentage: {ownership.toFixed(4)}%</Text>
          <Text style={styles.text}>Investment Date: {formatDate(investment.created_at)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>{specificTerms.split('\n')[1]}</Text>
          {specificTerms.split('\n').slice(2).map((line: string, i: number) => (
            <Text key={i} style={styles.text}>{line}</Text>
          ))}
        </View>

        <DocumentFooter documentId={documentNumber} />
      </Page>
      
      <Page size="A4" style={styles.page}>
        <Watermark text="ORIGINAL" />
        <DocumentHeader 
          documentType="Investment Agreement" 
          documentNumber={documentNumber} 
          date={currentDate} 
        />

        <View style={styles.section}>
          <Text style={styles.heading}>4. RIGHTS AND OBLIGATIONS</Text>
          {getRightsAndObligations().split('\n').map((line: string, i: number) => (
            <Text key={i} style={styles.text}>{line}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. RISK DISCLOSURES</Text>
          {getRiskDisclosures().split('\n').map((line: string, i: number) => (
            <Text key={i} style={styles.text}>{line}</Text>
          ))}
        </View>

        <DocumentFooter documentId={documentNumber} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Watermark text="ORIGINAL" />
        <DocumentHeader 
          documentType="Investment Agreement" 
          documentNumber={documentNumber} 
          date={currentDate} 
        />

        <View style={styles.section}>
          <Text style={styles.heading}>6. REGULATORY COMPLIANCE</Text>
          {getNigerianCompliance().split('\n').map((line: string, i: number) => (
            <Text key={i} style={styles.text}>{line}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. DISPUTE RESOLUTION</Text>
          {getDisputeResolution().split('\n').map((line: string, i: number) => (
            <Text key={i} style={styles.text}>{line}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. GENERAL PROVISIONS</Text>
          {getGeneralProvisions().split('\n').map((line: string, i: number) => (
            <Text key={i} style={styles.text}>{line}</Text>
          ))}
        </View>

        <View style={[styles.section, { marginTop: 30 }]}>
          <Text style={styles.bold}>ACKNOWLEDGMENT</Text>
          <Text style={styles.text}>By accepting this investment, the investor acknowledges that they have:</Text>
          <Text style={styles.text}>✓ Read and understood the terms of this agreement</Text>
          <Text style={styles.text}>✓ Reviewed the property details and risk disclosures</Text>
          <Text style={styles.text}>✓ Completed KYC verification</Text>
          <Text style={styles.text}>✓ Agreed to the platform's Terms of Service</Text>
          <Text style={[styles.text, { marginTop: 10, fontSize: 8, fontStyle: 'italic' }]}>
            This agreement was electronically signed and timestamped on the PropChain platform.
            Electronic signatures are legally binding under Nigerian law.
          </Text>
        </View>

        <DocumentFooter documentId={documentNumber} />
      </Page>
    </Document>
  );

  // Render to buffer
  const pdfBuffer = await renderToBuffer(MyDocument);
  return new Uint8Array(pdfBuffer);
}

export async function generateReceiptPDF(data: InvestmentData): Promise<Uint8Array> {
  const { investment, kycData, documentNumber, currentDate } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;

  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader 
          documentType="Investment Receipt" 
          documentNumber={documentNumber} 
          date={currentDate} 
        />
        
        <Text style={styles.documentTitle}>INVESTMENT RECEIPT</Text>
        <Text style={styles.documentMeta}>
          Receipt No: {documentNumber} | Date: {formatDate(currentDate)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.heading}>PAYMENT DETAILS</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Transaction Reference:</Text>
            <Text style={styles.tableCellRight}>{investment.paystack_reference || 'WALLET-' + investment.id.substring(0, 8)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Payment Method:</Text>
            <Text style={styles.tableCellRight}>{investment.payment_method === 'wallet' ? 'Wallet Balance' : 'Card/Bank'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Payment Status:</Text>
            <Text style={styles.tableCellRight}>{investment.payment_status.toUpperCase()}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Payment Date:</Text>
            <Text style={styles.tableCellRight}>
              {investment.payment_confirmed_at ? formatDate(investment.payment_confirmed_at) : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>INVESTOR INFORMATION</Text>
          <Text style={styles.text}>Name: {investor.first_name} {investor.last_name}</Text>
          <Text style={styles.text}>Email: {investor.email}</Text>
          {investor.phone && <Text style={styles.text}>Phone: {investor.phone}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>INVESTMENT DETAILS</Text>
          <Text style={styles.text}>Property: {property.title}</Text>
          <Text style={styles.text}>Tokens Allocated: {investment.tokens_requested.toLocaleString()} {tokenization.token_symbol}</Text>
          <Text style={styles.text}>Price per Token: {formatNaira(tokenization.price_per_token)}</Text>
          <Text style={styles.text}>Ownership: {((investment.tokens_requested / tokenization.total_supply) * 100).toFixed(4)}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>FINANCIAL BREAKDOWN</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Investment Amount:</Text>
            <Text style={styles.tableCellRight}>{formatNaira(investment.amount_ngn)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Platform Fee:</Text>
            <Text style={styles.tableCellRight}>₦0.00</Text>
          </View>
          <View style={[styles.tableRow, { borderTop: '2px solid #21c45d', paddingTop: 8, fontWeight: 'bold' }]}>
            <Text style={[styles.tableCell, styles.bold]}>TOTAL PAID:</Text>
            <Text style={[styles.tableCellRight, styles.bold]}>{formatNaira(investment.amount_ngn)}</Text>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 30, padding: 10, backgroundColor: '#f9f9f9', borderLeft: '4px solid #21c45d' }]}>
          <Text style={[styles.text, { fontSize: 8, fontStyle: 'italic' }]}>
            This receipt confirms your payment and token allocation. Tokens are recorded on the Hedera blockchain.
            You can view your investment in your portfolio dashboard.
          </Text>
        </View>

        <DocumentFooter documentId={documentNumber} />
      </Page>
    </Document>
  );

  const pdfBuffer = await renderToBuffer(MyDocument);
  return new Uint8Array(pdfBuffer);
}

export async function generateShareCertificatePDF(data: InvestmentData): Promise<Uint8Array> {
  const { investment, kycData, documentNumber, currentDate } = data;
  const tokenization = investment.tokenizations;
  const property = tokenization.properties;
  const investor = investment.investor;
  const ownership = (investment.tokens_requested / tokenization.total_supply) * 100;

  const certificateStyles = StyleSheet.create({
    ...styles,
    certificateBorder: {
      border: '3px double #21c45d',
      padding: 20,
      marginTop: 20,
      marginBottom: 20,
    },
    certificateTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#21c45d',
      marginVertical: 20,
    },
    certificateBody: {
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 1.8,
      marginVertical: 20,
    },
  });

  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Watermark text="CERTIFIED" />
        <DocumentHeader 
          documentType="Share Certificate" 
          documentNumber={documentNumber} 
          date={currentDate} 
        />

        <View style={certificateStyles.certificateBorder}>
          <Text style={certificateStyles.certificateTitle}>CERTIFICATE OF TOKEN OWNERSHIP</Text>
          <Text style={[styles.documentMeta, { marginBottom: 30 }]}>
            Certificate No: {documentNumber}
          </Text>

          <Text style={certificateStyles.certificateBody}>
            THIS IS TO CERTIFY THAT
          </Text>

          <Text style={[certificateStyles.certificateBody, styles.bold, { fontSize: 14 }]}>
            {investor.first_name} {investor.last_name}
          </Text>

          <Text style={certificateStyles.certificateBody}>
            is the registered holder of
          </Text>

          <Text style={[certificateStyles.certificateBody, styles.bold, { fontSize: 16, color: '#21c45d' }]}>
            {investment.tokens_requested.toLocaleString()} Digital Tokens
          </Text>

          <Text style={certificateStyles.certificateBody}>
            Token Symbol: {tokenization.token_symbol} | Token ID: {tokenization.token_id || 'Pending'}
          </Text>

          <Text style={certificateStyles.certificateBody}>
            representing fractional ownership in the property located at:
          </Text>

          <Text style={[certificateStyles.certificateBody, styles.bold]}>
            {property.title}
          </Text>

          <Text style={certificateStyles.certificateBody}>
            Ownership Percentage: {ownership.toFixed(4)}% | Total Property Value: {formatNaira(property.estimated_value)}
          </Text>

          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <Text style={[styles.text, { fontSize: 9 }]}>Token Holding Rights:</Text>
            <Text style={[styles.text, { fontSize: 9 }]}>✓ Receive proportional dividends/income</Text>
            <Text style={[styles.text, { fontSize: 9 }]}>✓ Vote on governance proposals</Text>
            <Text style={[styles.text, { fontSize: 9 }]}>✓ Transfer tokens (subject to terms)</Text>
            <Text style={[styles.text, { fontSize: 9 }]}>✓ Access property information and reports</Text>
          </View>

          <View style={{ marginTop: 40 }}>
            <Text style={[styles.text, { fontSize: 8, textAlign: 'center' }]}>
              ___________________________
            </Text>
            <Text style={[styles.text, { fontSize: 8, textAlign: 'center', marginTop: 5 }]}>
              {COMPANY_INFO.name}
            </Text>
            <Text style={[styles.text, { fontSize: 8, textAlign: 'center' }]}>
              Authorized Signatory
            </Text>
            <Text style={[styles.text, { fontSize: 8, textAlign: 'center' }]}>
              Date: {formatDate(currentDate)}
            </Text>
          </View>
        </View>

        <Text style={[styles.text, { fontSize: 8, textAlign: 'center', fontStyle: 'italic' }]}>
          This certificate is issued on the Hedera blockchain and represents legally binding ownership rights.
        </Text>

        <DocumentFooter documentId={documentNumber} />
      </Page>
    </Document>
  );

  const pdfBuffer = await renderToBuffer(MyDocument);
  return new Uint8Array(pdfBuffer);
}
