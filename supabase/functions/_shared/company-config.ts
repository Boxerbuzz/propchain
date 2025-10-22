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
    // PropChain logo - base64 encoded PNG
    logo_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAACAASURBVHic7N15nBTV3e/xz6mq7p4FGBYB2QQEN0RFQdwVjRpj4hI1xmhMNJrEJTdRc2+uS4xLNPfFJGpiYuKaxMQtLhFjjEtcUNyiCAiKssgyzLL0dNc5949hYGCmu6u7q7vn/N6vl6/Y6arT53Sd0/X7nXPqVCmttUYIIYQQbUrbHYAQQggh7CcJgBBCCNEOSQIghBBCtEOSAAghh"
  }
} as const;

export const DOCUMENTS_HCS_TOPIC_ID = '0.0.XXXXXX'; // TODO: Create dedicated topic for document hashes
