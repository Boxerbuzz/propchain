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
    email: 'info@relett.com',
    phone: '+234-XXX-XXX-XXXX',
    website: 'https://invest.relett.com',
    support: 'support@relett.com'
  },
  legal: {
    vat_number: 'VAT-XXXXXXX',
    tin: 'TIN-XXXXXXX',
    sec_registration: 'SEC/XXXXXXX'
  },
  branding: {
    primary_color: '#21c45d',
    secondary_color: '#1a9d4a',
    logo_base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjMjFjNDVkIi8+CjxwYXRoIGQ9Ik0yNTYgMTI4QzIxNy42IDEyOCAxODYgMTU5LjYgMTg2IDE5OEMxODYgMjM2LjQgMjE3LjYgMjY4IDI1NiAyNjhDMjk0LjQgMjY4IDMyNiAyMzYuNCAzMjYgMTk4QzMyNiAxNTkuNiAyOTQuNCAxMjggMjU2IDEyOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNTYgMjQ0QzMzNi40IDI0NCAzODQgMjkxLjYgMzg0IDM3MkMzODQgMzg0IDM4NCAzODQgMzg0IDM4NEgxMjhDMTI4IDM4NCAxMjggMzg0IDEyOCAzNzJDMTI4IDI5MS42IDE3NS42IDI0NCAyNTYgMjQ0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=='
  }
} as const;

// HCS topic for document verification - MUST be set in environment variables
// Created via setup-documents-hcs-topic function: 0.0.7154376
export const getDocumentsHCSTopicId = (): string => {
  const topicId = Deno.env.get('DOCUMENTS_HCS_TOPIC_ID');
  if (!topicId) {
    throw new Error('DOCUMENTS_HCS_TOPIC_ID environment variable is not set. Run setup-documents-hcs-topic function.');
  }
  return topicId;
};
