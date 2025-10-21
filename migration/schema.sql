-- ============================================
-- COMPLETE DATABASE SCHEMA FOR REAL ESTATE TOKENIZATION PLATFORM
-- Updated: 2025-01-21
-- ============================================

-- Enhanced Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT DEFAULT 'Nigeria',
  state_of_residence TEXT,
  occupation TEXT,
  annual_income DECIMAL,
  investment_experience TEXT, -- beginner, intermediate, advanced
  hedera_account_id TEXT,
  kyc_status TEXT DEFAULT 'not_started', -- not_started, pending, approved, rejected, expired
  kyc_level TEXT DEFAULT 'tier_1', -- tier_1, tier_2, tier_3
  account_status TEXT DEFAULT 'active', -- active, suspended, closed
  wallet_type TEXT, -- custodial, external, hybrid
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL, -- {address, city, state, lat, lng, landmarks}
  property_type TEXT NOT NULL, -- residential, commercial, industrial, land, mixed_use
  property_subtype TEXT, -- apartment, house, office, warehouse, etc.
  land_size DECIMAL, -- square meters
  built_up_area DECIMAL, -- square meters
  bedrooms INTEGER,
  bathrooms INTEGER,
  year_built INTEGER,
  condition TEXT, -- excellent, good, fair, needs_renovation
  amenities JSONB, -- array of amenities
  estimated_value DECIMAL NOT NULL,
  market_value DECIMAL, -- current market valuation
  rental_income_monthly DECIMAL,
  rental_yield DECIMAL, -- percentage
  owner_id UUID REFERENCES users(id),
  property_manager_id UUID REFERENCES users(id),
  hcs_topic_id TEXT,
  hfs_file_ids JSONB,
  approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected, suspended
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  verification_score INTEGER DEFAULT 0, -- 0-100
  listing_status TEXT DEFAULT 'draft', -- draft, active, sold, withdrawn
  featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property images
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT, -- exterior, interior, amenity, document, floor_plan
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  hfs_file_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Property documents (enhanced)
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- title_deed, survey, valuation, tax_receipt, insurance, etc.
  document_name TEXT NOT NULL,
  file_url TEXT,
  hfs_file_id TEXT,
  file_hash TEXT,
  file_size BIGINT,
  mime_type TEXT,
  expiry_date DATE,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Tokenizations table
CREATE TABLE IF NOT EXISTS tokenizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  token_id TEXT, -- Hedera Token ID
  token_name TEXT,
  token_symbol TEXT,
  tokenization_type TEXT NOT NULL DEFAULT 'equity', -- equity, debt, revenue_share
  total_supply BIGINT NOT NULL,
  price_per_token DECIMAL NOT NULL,
  min_investment DECIMAL NOT NULL,
  max_investment DECIMAL,
  min_tokens_per_purchase BIGINT DEFAULT 1,
  max_tokens_per_purchase BIGINT,
  investment_window_start TIMESTAMP NOT NULL,
  investment_window_end TIMESTAMP NOT NULL,
  minimum_raise DECIMAL NOT NULL,
  target_raise DECIMAL,
  current_raise DECIMAL DEFAULT 0,
  tokens_sold BIGINT DEFAULT 0,
  investor_count INTEGER DEFAULT 0,
  expected_roi_annual DECIMAL, -- percentage
  dividend_frequency TEXT, -- monthly, quarterly, annually
  interest_rate DECIMAL, -- for debt tokenization
  revenue_share_percentage DECIMAL, -- for revenue sharing
  management_fee_percentage DECIMAL DEFAULT 2.5,
  platform_fee_percentage DECIMAL DEFAULT 1.0,
  use_of_funds JSONB DEFAULT '[]', -- array of fund allocation items
  use_of_funds_breakdown JSONB, -- detailed breakdown
  type_specific_terms JSONB DEFAULT '{}', -- additional terms based on type
  terms_accepted_at TIMESTAMP,
  
  -- Treasury management
  treasury_account_id TEXT,
  treasury_account_private_key_vault_id UUID,
  treasury_balance_ngn DECIMAL DEFAULT 0,
  treasury_balance_usdc DECIMAL DEFAULT 0,
  treasury_balance_hbar DECIMAL DEFAULT 0,
  treasury_created_at TIMESTAMP,
  total_revenue_received_ngn DECIMAL DEFAULT 0,
  total_revenue_received_usdc DECIMAL DEFAULT 0,
  
  status TEXT DEFAULT 'draft', -- draft, upcoming, active, closed, minting, completed, failed
  auto_refund BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  minting_transaction_id TEXT,
  minted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenization_id UUID REFERENCES tokenizations(id),
  investor_id UUID REFERENCES users(id),
  amount_ngn DECIMAL NOT NULL,
  amount_usd DECIMAL,
  exchange_rate DECIMAL,
  payment_currency TEXT DEFAULT 'ngn',
  tokens_requested BIGINT NOT NULL,
  tokens_allocated BIGINT DEFAULT 0,
  percentage_ownership DECIMAL,
  paystack_reference TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_confirmed_at TIMESTAMP,
  refund_processed_at TIMESTAMP,
  refund_amount DECIMAL,
  investment_source TEXT,
  reservation_status TEXT DEFAULT 'pending',
  reservation_expires_at TIMESTAMP,
  terms_version TEXT DEFAULT '1.0',
  terms_accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Events (parent table for all property-related events)
CREATE TABLE IF NOT EXISTS property_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  event_type TEXT NOT NULL, -- inspection, maintenance, rental, purchase
  event_date TIMESTAMP NOT NULL,
  event_status TEXT DEFAULT 'completed',
  summary TEXT,
  notes TEXT,
  amount_ngn DECIMAL,
  amount_usd DECIMAL,
  conducted_by UUID REFERENCES users(id),
  conducted_by_name TEXT,
  conducted_by_company TEXT,
  event_details JSONB NOT NULL, -- type-specific details
  photos JSONB,
  documents JSONB,
  hcs_topic_id TEXT,
  hcs_transaction_id TEXT,
  hcs_sequence_number TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Inspections (linked to events)
CREATE TABLE IF NOT EXISTS property_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  property_event_id UUID REFERENCES property_events(id),
  inspection_date TIMESTAMP NOT NULL,
  inspection_type TEXT NOT NULL, -- pre_purchase, routine, damage_assessment
  inspector_id UUID REFERENCES users(id),
  inspector_name TEXT,
  inspector_company TEXT,
  inspector_license TEXT,
  
  -- Structural assessments
  structural_condition TEXT,
  foundation_status TEXT,
  roof_status TEXT,
  walls_status TEXT,
  electrical_status TEXT,
  plumbing_status TEXT,
  room_assessments JSONB,
  
  -- Issues and repairs
  issues_found JSONB,
  required_repairs JSONB,
  estimated_repair_cost DECIMAL,
  
  -- Valuations
  overall_rating INTEGER,
  market_value_estimate DECIMAL,
  rental_value_estimate DECIMAL,
  
  inspection_photos JSONB,
  inspection_report_url TEXT,
  hcs_transaction_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Maintenance (linked to events)
CREATE TABLE IF NOT EXISTS property_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  property_event_id UUID REFERENCES property_events(id),
  proposal_id UUID REFERENCES governance_proposals(id),
  maintenance_date TIMESTAMP NOT NULL,
  maintenance_type TEXT NOT NULL, -- routine, emergency, repair, upgrade
  maintenance_status TEXT DEFAULT 'scheduled',
  issue_description TEXT NOT NULL,
  issue_severity TEXT,
  issue_category TEXT,
  work_performed TEXT,
  
  -- Contractor details
  contractor_name TEXT,
  contractor_company TEXT,
  contractor_phone TEXT,
  contractor_license TEXT,
  
  -- Financial
  estimated_cost_ngn DECIMAL,
  actual_cost_ngn DECIMAL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  invoice_url TEXT,
  
  -- Documentation
  before_photos JSONB,
  after_photos JSONB,
  parts_replaced JSONB,
  warranty_info TEXT,
  warranty_expiry_date DATE,
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  completion_date TIMESTAMP,
  notes TEXT,
  
  hcs_transaction_id TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Rentals (linked to events)
CREATE TABLE IF NOT EXISTS property_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  property_event_id UUID REFERENCES property_events(id),
  
  -- Tenant information
  tenant_name TEXT NOT NULL,
  tenant_email TEXT,
  tenant_phone TEXT,
  tenant_id_number TEXT,
  
  -- Rental terms
  rental_type TEXT, -- short_term, long_term, commercial
  monthly_rent_ngn DECIMAL NOT NULL,
  security_deposit_ngn DECIMAL,
  agency_fee_ngn DECIMAL,
  legal_fee_ngn DECIMAL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  lease_duration_months INTEGER,
  
  -- Lease details
  lease_agreement_url TEXT,
  agreement_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP,
  utilities_included JSONB,
  special_terms TEXT,
  
  -- Payment tracking
  amount_paid_ngn DECIMAL DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  rental_status TEXT DEFAULT 'active',
  
  -- Distribution to investors
  distribution_id UUID REFERENCES dividend_distributions(id),
  distribution_status TEXT DEFAULT 'pending',
  distributed_at TIMESTAMP,
  
  hcs_transaction_id TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Purchases/Sales (linked to events)
CREATE TABLE IF NOT EXISTS property_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  property_event_id UUID REFERENCES property_events(id),
  transaction_type TEXT NOT NULL, -- full_sale, partial_sale, buyback
  
  -- Buyer information
  buyer_user_id UUID REFERENCES users(id),
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_id_number TEXT,
  
  -- Seller information
  seller_user_id UUID REFERENCES users(id),
  seller_name TEXT,
  
  -- Transaction details
  purchase_price_ngn DECIMAL NOT NULL,
  purchase_price_usd DECIMAL,
  tokens_involved BIGINT,
  percentage_sold DECIMAL,
  
  -- Payment details
  down_payment_ngn DECIMAL,
  remaining_balance_ngn DECIMAL,
  payment_plan TEXT,
  payment_method TEXT,
  
  -- Legal documents
  sale_agreement_url TEXT,
  title_transfer_doc_url TEXT,
  agreement_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP,
  
  -- Transaction status
  transaction_status TEXT DEFAULT 'pending',
  completion_date DATE,
  
  hcs_transaction_id TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Treasury Transactions
CREATE TABLE IF NOT EXISTS property_treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tokenization_id UUID REFERENCES tokenizations(id),
  transaction_type TEXT NOT NULL, -- deposit, withdrawal, fee, distribution
  source_type TEXT NOT NULL, -- rental, sale, investment, maintenance
  source_event_id UUID REFERENCES property_events(id),
  amount_ngn DECIMAL NOT NULL,
  amount_usdc DECIMAL,
  exchange_rate DECIMAL,
  hedera_transaction_id TEXT,
  paystack_reference TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Investment Documents (generated documents)
CREATE TABLE IF NOT EXISTS investment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID REFERENCES investments(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  tokenization_id UUID REFERENCES tokenizations(id) NOT NULL,
  property_id UUID REFERENCES properties(id) NOT NULL,
  document_type TEXT NOT NULL, -- token_certificate, subscription_agreement, disclosure
  document_number TEXT NOT NULL,
  document_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chat rooms with enhanced features
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tokenization_id UUID REFERENCES tokenizations(id),
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT DEFAULT 'investment', -- investment, governance, general, support
  is_public BOOLEAN DEFAULT FALSE,
  max_participants INTEGER,
  auto_join_investors BOOLEAN DEFAULT TRUE, -- auto-add new investors
  ai_assistant_enabled BOOLEAN DEFAULT TRUE,
  moderation_enabled BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat room participants
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- admin, moderator, member, observer
  joined_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP,
  is_muted BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  voting_power BIGINT DEFAULT 0, -- based on token holdings
  UNIQUE(room_id, user_id)
);

-- Enhanced Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  reply_to_id UUID REFERENCES chat_messages(id),
  message_text TEXT,
  message_type TEXT DEFAULT 'text', -- text, system, proposal, vote, announcement, ai_response
  metadata JSONB, -- additional data like proposal_id, vote_data, etc.
  attachments JSONB, -- array of file URLs/IDs
  is_pinned BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  reactions JSONB DEFAULT '{}', -- {emoji: [user_ids]}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Governance proposals
CREATE TABLE IF NOT EXISTS governance_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tokenization_id UUID REFERENCES tokenizations(id),
  proposer_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposal_type TEXT NOT NULL, -- maintenance, sale, renovation, dividend, management_change, etc.
  budget_ngn DECIMAL,
  budget_usd DECIMAL,
  supporting_documents JSONB, -- array of document URLs
  voting_start TIMESTAMP NOT NULL,
  voting_end TIMESTAMP NOT NULL,
  quorum_required DECIMAL DEFAULT 50.0, -- percentage of total tokens needed to vote
  approval_threshold DECIMAL DEFAULT 60.0, -- percentage of votes needed to pass
  status TEXT DEFAULT 'draft', -- draft, active, passed, rejected, executed, expired
  total_votes_cast BIGINT DEFAULT 0,
  votes_for BIGINT DEFAULT 0,
  votes_against BIGINT DEFAULT 0,
  votes_abstain BIGINT DEFAULT 0,
  execution_date DATE,
  execution_status TEXT, -- pending, in_progress, completed, failed
  execution_notes TEXT,
  hcs_record_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES governance_proposals(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES users(id),
  vote_choice TEXT NOT NULL, -- for, against, abstain
  voting_power BIGINT NOT NULL, -- number of tokens at time of vote
  vote_weight DECIMAL, -- calculated weight based on token holdings
  vote_reason TEXT, -- optional explanation
  vote_transaction_id TEXT, -- blockchain transaction reference
  cast_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- Wallets (enhanced with Vault support)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_type TEXT NOT NULL, -- custodial, external, hardware
  wallet_name TEXT, -- user-defined name
  hedera_account_id TEXT UNIQUE,
  private_key_encrypted TEXT, -- deprecated - use vault_secret_id instead
  vault_secret_id UUID, -- reference to Supabase Vault secret
  public_key TEXT,
  balance_hbar DECIMAL DEFAULT 0,
  balance_ngn DECIMAL DEFAULT 0,
  balance_usd DECIMAL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  backup_completed BOOLEAN DEFAULT FALSE,
  security_level TEXT DEFAULT 'standard', -- basic, standard, high
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, hedera_account_id)
);

-- Token holdings (track all user token holdings)
CREATE TABLE IF NOT EXISTS token_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tokenization_id UUID REFERENCES tokenizations(id),
  property_id UUID REFERENCES properties(id),
  token_id TEXT NOT NULL, -- Hedera token ID
  balance BIGINT NOT NULL DEFAULT 0,
  locked_balance BIGINT DEFAULT 0, -- tokens locked in governance/staking
  average_purchase_price DECIMAL, -- average price paid per token
  total_invested_ngn DECIMAL DEFAULT 0,
  realized_returns_ngn DECIMAL DEFAULT 0, -- from dividends, sales
  unrealized_returns_ngn DECIMAL DEFAULT 0, -- current value - invested
  last_dividend_received_at TIMESTAMP,
  acquisition_date TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tokenization_id)
);

-- Activity logs (comprehensive tracking)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  tokenization_id UUID REFERENCES tokenizations(id),
  activity_type TEXT NOT NULL, -- investment, vote, proposal, chat, login, kyc, etc.
  activity_category TEXT, -- financial, governance, social, security
  description TEXT NOT NULL,
  metadata JSONB, -- additional activity-specific data
  ip_address INET,
  user_agent TEXT,
  hcs_transaction_id TEXT, -- if logged to Hedera
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- investment, governance, system, marketing
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  action_url TEXT, -- deep link to relevant page
  action_data JSONB, -- additional data for action
  read_at TIMESTAMP,
  sent_via TEXT[], -- ['email', 'push', 'sms', 'in_app']
  delivery_status JSONB, -- status for each channel
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Dividend distributions
CREATE TABLE IF NOT EXISTS dividend_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tokenization_id UUID REFERENCES tokenizations(id),
  distribution_period TEXT, -- "2024-Q1", "2024-03", etc.
  total_amount_ngn DECIMAL NOT NULL,
  total_amount_usd DECIMAL,
  per_token_amount DECIMAL NOT NULL,
  distribution_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  total_recipients INTEGER,
  successful_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  hcs_record_id TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual dividend payments
CREATE TABLE IF NOT EXISTS dividend_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES dividend_distributions(id),
  recipient_id UUID REFERENCES users(id),
  tokenization_id UUID REFERENCES tokenizations(id),
  tokens_held BIGINT NOT NULL,
  amount_ngn DECIMAL NOT NULL,
  amount_usd DECIMAL,
  payment_method TEXT, -- wallet, bank_transfer
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending, sent, received, failed
  tax_withheld DECIMAL DEFAULT 0,
  net_amount DECIMAL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System settings/configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT, -- number, string, boolean, json
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- can be accessed by frontend
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- KYC verification table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Verification status
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, pending, approved, rejected, expired
  kyc_level TEXT NOT NULL DEFAULT 'tier_1', -- tier_1, tier_2, tier_3
  
  -- Personal information
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  nationality TEXT,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  
  -- Document information
  id_type TEXT, -- nin, bvn, drivers_license, passport, voters_card
  id_number TEXT,
  id_expiry_date DATE,
  
  -- Document uploads (store URLs from storage)
  id_document_front_url TEXT,
  id_document_back_url TEXT,
  selfie_url TEXT,
  proof_of_address_url TEXT,
  
  -- Verification details
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  
  -- Third-party verification
  provider TEXT, -- smile_identity, youverify, verified_africa
  provider_reference_id TEXT,
  provider_response JSONB,
  
  -- Compliance
  pep_check BOOLEAN DEFAULT false, -- Politically Exposed Person
  sanction_check BOOLEAN DEFAULT false,
  adverse_media_check BOOLEAN DEFAULT false,
  
  -- Investment limits based on KYC level
  investment_limit_ngn NUMERIC,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- KYC typically expires after 1-2 years
);

-- KYC Drafts table (for saving KYC progress)
CREATE TABLE IF NOT EXISTS kyc_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'document_type',
  completed_steps TEXT[] DEFAULT '{}',
  form_data JSONB NOT NULL DEFAULT '{}',
  document_image_url TEXT,
  selfie_url TEXT,
  proof_of_address_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_hedera_account ON users(hedera_account_id);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(approval_status, listing_status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_tokenizations_status ON tokenizations(status);
CREATE INDEX IF NOT EXISTS idx_tokenizations_window ON tokenizations(investment_window_start, investment_window_end);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_tokenization ON investments(tokenization_id);
CREATE INDEX IF NOT EXISTS idx_investments_payment_status ON investments(payment_status);
CREATE INDEX IF NOT EXISTS idx_investments_reservation ON investments(reservation_status, reservation_expires_at);
CREATE INDEX IF NOT EXISTS idx_property_events_property ON property_events(property_id, event_date);
CREATE INDEX IF NOT EXISTS idx_property_events_type ON property_events(event_type);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_property ON governance_proposals(property_id);
CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_token_holdings_user ON token_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_token_holdings_tokenization ON token_holdings(tokenization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_drafts_user ON kyc_drafts(user_id);

-- View: User chat rooms with last message
CREATE OR REPLACE VIEW user_chat_rooms_with_last_message AS
SELECT
  cp.user_id,
  cp.room_id,
  cp.role,
  cp.joined_at,
  cp.last_seen_at,
  cp.voting_power,
  cr.name as room_name,
  cr.description as room_description,
  cr.room_type,
  p.title as property_title,
  p.location as property_location,
  t.token_symbol,
  t.status as tokenization_status,
  lm.message_text as last_message,
  lm.created_at as last_message_at,
  lm.message_type as last_message_type,
  u.first_name as last_sender_first_name,
  u.last_name as last_sender_last_name,
  (
    SELECT count(*)
    FROM chat_messages cm2
    WHERE cm2.room_id = cp.room_id
      AND cm2.created_at > COALESCE(cp.last_seen_at, '1970-01-01 00:00:00'::timestamp)
  ) as unread_count
FROM chat_participants cp
JOIN chat_rooms cr ON cp.room_id = cr.id
LEFT JOIN properties p ON cr.property_id = p.id
LEFT JOIN tokenizations t ON cr.tokenization_id = t.id
LEFT JOIN LATERAL (
  SELECT cm.message_text, cm.created_at, cm.message_type, cm.sender_id
  FROM chat_messages cm
  WHERE cm.room_id = cp.room_id
  ORDER BY cm.created_at DESC
  LIMIT 1
) lm ON true
LEFT JOIN users u ON lm.sender_id = u.id;
