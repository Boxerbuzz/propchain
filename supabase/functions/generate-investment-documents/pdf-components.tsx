/** @jsx jsx */
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { COMPANY_INFO } from '../_shared/company-config.ts';

// PDF Styles
export const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    lineHeight: 1.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 16,
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
  indent: {
    marginLeft: 20,
  },
  table: {
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e0e0e0',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
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
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#666666',
    paddingTop: 10,
    borderTop: '1px solid #e0e0e0',
  },
  qrCode: {
    width: 80,
    height: 80,
    marginTop: 10,
  },
  signatureBlock: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '2px dashed #cccccc',
  },
  signatureLine: {
    borderBottom: '1px solid #000000',
    width: 200,
    marginTop: 40,
    marginBottom: 5,
  },
  certificateBorder: {
    border: '3px double #21c45d',
    padding: 20,
    marginTop: 20,
  },
  certificateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#21c45d',
    marginVertical: 20,
  },
  certificateNumber: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 30,
  },
  certificateBody: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 1.8,
    marginVertical: 20,
  },
  certificateDetail: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  receiptBox: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 10,
    borderLeft: '4px solid #21c45d',
  },
  totalRow: {
    borderTop: '2px solid #21c45d',
    paddingTop: 8,
    fontWeight: 'bold',
    fontSize: 11,
  },
});

// Document Header Component
export const DocumentHeader = ({ documentType, documentNumber, date }: { documentType: string; documentNumber: string; date: string }) => (
  <View style={styles.header}>
    <Image src={COMPANY_INFO.branding.logo_base64} style={styles.logo} />
    <View style={styles.companyInfo}>
      <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
      <Text>RC: {COMPANY_INFO.rc_number}</Text>
      <Text>{COMPANY_INFO.address.street}</Text>
      <Text>{COMPANY_INFO.address.city}, {COMPANY_INFO.address.state}</Text>
      <Text>{COMPANY_INFO.contact.email} | {COMPANY_INFO.contact.phone}</Text>
    </View>
  </View>
);

// Document Footer Component
export const DocumentFooter = ({ documentId, pageNumber }: { documentId: string; pageNumber?: number }) => (
  <View style={styles.footer} fixed>
    <Text>Document ID: {documentId}</Text>
    <Text>{COMPANY_INFO.contact.website}</Text>
    {pageNumber && <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />}
  </View>
);

// Watermark Component
export const Watermark = ({ text }: { text: string }) => (
  <Text style={styles.watermark} fixed>{text}</Text>
);

// QR Code Component
export const QRCodeImage = ({ dataUrl }: { dataUrl: string }) => (
  <View style={{ alignItems: 'center', marginTop: 20 }}>
    <Image src={dataUrl} style={styles.qrCode} />
    <Text style={{ fontSize: 8, color: '#666666', marginTop: 5 }}>
      Scan to verify document authenticity
    </Text>
  </View>
);

// Signature Block Component
export const SignatureBlock = ({ signedDate, investorName }: { signedDate: string; investorName: string }) => (
  <View style={styles.signatureBlock}>
    <Text style={styles.heading}>SIGNATURES</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
      <View>
        <View style={styles.signatureLine} />
        <Text style={{ fontSize: 9, marginTop: 5 }}>PropChain Technologies Limited</Text>
        <Text style={{ fontSize: 8, color: '#666666' }}>Authorized Signatory</Text>
        <Text style={{ fontSize: 8, color: '#666666' }}>Date: {signedDate}</Text>
      </View>
      <View>
        <View style={styles.signatureLine} />
        <Text style={{ fontSize: 9, marginTop: 5 }}>{investorName}</Text>
        <Text style={{ fontSize: 8, color: '#666666' }}>Investor (Digital Signature)</Text>
        <Text style={{ fontSize: 8, color: '#666666' }}>Date: {signedDate}</Text>
      </View>
    </View>
    <Text style={{ fontSize: 8, color: '#666666', marginTop: 20, fontStyle: 'italic' }}>
      This agreement was electronically signed and timestamped on the PropChain platform.
      Electronic signatures are legally binding under Nigerian law.
    </Text>
  </View>
);

// Financial Table Component
export const FinancialTable = ({ items, total }: { items: Array<{ label: string; amount: string }>; total: string }) => (
  <View style={styles.table}>
    {items.map((item, index) => (
      <View key={index} style={styles.tableRow}>
        <Text style={styles.tableCell}>{item.label}</Text>
        <Text style={styles.tableCellRight}>{item.amount}</Text>
      </View>
    ))}
    <View style={[styles.tableRow, styles.totalRow]}>
      <Text style={styles.tableCell}>TOTAL AMOUNT</Text>
      <Text style={styles.tableCellRight}>{total}</Text>
    </View>
  </View>
);
