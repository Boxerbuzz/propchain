// Database types - matching the actual Supabase schema
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  state_of_residence?: string;
  occupation?: string;
  annual_income?: number;
  investment_experience?: string;
  hedera_account_id?: string;
  kyc_status?: string;
  kyc_level?: string;
  account_status?: string;
  wallet_type?: string;
  referral_code?: string;
  referred_by?: string;
  email_verified_at?: string;
  phone_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  location: any; // JSONB
  property_type: string;
  property_subtype?: string;
  land_size?: number;
  built_up_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  condition?: string;
  amenities?: any; // JSONB
  estimated_value: number;
  market_value?: number;
  rental_income_monthly?: number;
  rental_yield?: number;
  owner_id?: string;
  property_manager_id?: string;
  hcs_topic_id?: string;
  hfs_file_ids?: any; // JSONB
  approval_status?: string;
  approved_by?: string;
  approved_at?: string;
  listing_status?: string;
  verification_score?: number;
  featured?: boolean;
  views_count?: number;
  favorites_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Tokenization {
  id: string;
  property_id?: string;
  token_id?: string;
  token_name?: string;
  token_symbol?: string;
  total_supply: number;
  price_per_token: number;
  min_investment: number;
  max_investment?: number;
  min_tokens_per_purchase?: number;
  max_tokens_per_purchase?: number;
  investment_window_start: string;
  investment_window_end: string;
  minimum_raise: number;
  target_raise?: number;
  current_raise?: number;
  tokens_sold?: number;
  investor_count?: number;
  expected_roi_annual?: number;
  dividend_frequency?: string;
  management_fee_percentage?: number;
  platform_fee_percentage?: number;
  status?: string;
  auto_refund?: boolean;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  minting_transaction_id?: string;
  minted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Investment {
  id: string;
  tokenization_id?: string;
  investor_id?: string;
  amount_ngn: number;
  amount_usd?: number;
  exchange_rate?: number;
  tokens_requested: number;
  tokens_allocated?: number;
  percentage_ownership?: number;
  paystack_reference?: string;
  payment_status?: string;
  payment_method?: string;
  payment_confirmed_at?: string;
  refund_processed_at?: string;
  refund_amount?: number;
  investment_source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TokenHolding {
  id: string;
  user_id?: string;
  property_id?: string;
  tokenization_id?: string;
  token_id: string;
  balance: number;
  locked_balance?: number;
  acquisition_date?: string;
  average_purchase_price?: number;
  total_invested_ngn?: number;
  unrealized_returns_ngn?: number;
  realized_returns_ngn?: number;
  last_dividend_received_at?: string;
  updated_at?: string;
}

export interface PropertyImage {
  id: string;
  property_id?: string;
  image_url: string;
  hfs_file_id?: string;
  image_type?: string;
  caption?: string;
  is_primary?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface PropertyDocument {
  id: string;
  property_id?: string;
  document_name: string;
  document_type: string;
  file_url?: string;
  hfs_file_id?: string;
  file_hash?: string;
  mime_type?: string;
  file_size?: number;
  verification_status?: string;
  verified_by?: string;
  verified_at?: string;
  expiry_date?: string;
  uploaded_by?: string;
  uploaded_at?: string;
}

export interface DividendDistribution {
  id: string;
  property_id?: string;
  tokenization_id?: string;
  total_amount_ngn: number;
  total_amount_usd?: number;
  per_token_amount: number;
  distribution_date: string;
  distribution_period?: string;
  total_recipients?: number;
  successful_payments?: number;
  failed_payments?: number;
  payment_status?: string;
  hcs_record_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DividendPayment {
  id: string;
  distribution_id?: string;
  tokenization_id?: string;
  recipient_id?: string;
  tokens_held: number;
  amount_ngn: number;
  amount_usd?: number;
  tax_withheld?: number;
  net_amount?: number;
  payment_status?: string;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  created_at?: string;
}

// Form Data Types
export interface InvestmentFormData {
  amountNgn: number;
  paymentMethod: 'paystack' | 'wallet';
}