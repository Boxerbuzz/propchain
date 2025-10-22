// PropChain company information and branding
export const COMPANY_INFO = {
  name: 'PropChain Technologies Limited',
  rc_number: 'RC-XXXXXXX', // TODO: Add actual RC number
  address: {
    street: 'Plot 123, Herbert Macaulay Way',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postal_code: '100001'
  },
  contact: {
    email: 'info@propchain.com',
    phone: '+234-XXX-XXX-XXXX',
    website: 'https://propchain.com',
    support: 'support@propchain.com'
  },
  legal: {
    vat_number: 'VAT-XXXXXXX',
    tin: 'TIN-XXXXXXX',
    sec_registration: 'SEC/XXXXXXX'
  },
  branding: {
    primary_color: '#21c45d',
    secondary_color: '#1a9d4a',
    // PropChain logo - base64 encoded PNG (TODO: Add actual company logo)
    logo_base64: ''
  }
} as const;

export const DOCUMENTS_HCS_TOPIC_ID = '0.0.XXXXXX'; // TODO: Create dedicated topic for document hashes
