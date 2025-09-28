-- Enhanced Users table
CREATE TABLE users (
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
  kyc_status TEXT DEFAULT 'pending', -- pending, verified, rejected, expired
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
CREATE TABLE properties (
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
CREATE TABLE property_images (
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
CREATE TABLE property_documents (
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
CREATE TABLE tokenizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  token_id TEXT, -- Hedera Token ID
  token_name TEXT,
  token_symbol TEXT,
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
  management_fee_percentage DECIMAL DEFAULT 2.5,
  platform_fee_percentage DECIMAL DEFAULT 1.0,
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
create table public.investments (
  id uuid not null default gen_random_uuid (),
  tokenization_id uuid null,
  investor_id uuid null,
  amount_ngn numeric not null,
  amount_usd numeric null,
  exchange_rate numeric null,
  tokens_requested bigint not null,
  tokens_allocated bigint null default 0,
  percentage_ownership numeric null,
  paystack_reference text null,
  payment_status text null default 'pending'::text,
  payment_method text null,
  payment_confirmed_at timestamp without time zone null,
  refund_processed_at timestamp without time zone null,
  refund_amount numeric null,
  investment_source text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  reservation_status text null default 'pending'::text,
  reservation_expires_at timestamp with time zone null,
  constraint investments_pkey primary key (id),
  constraint investments_paystack_reference_key unique (paystack_reference),
  constraint investments_investor_id_fkey foreign KEY (investor_id) references users (id),
  constraint investments_tokenization_id_fkey foreign KEY (tokenization_id) references tokenizations (id)
) TABLESPACE pg_default;

create index IF not exists idx_investments_investor on public.investments using btree (investor_id) TABLESPACE pg_default;

create index IF not exists idx_investments_tokenization on public.investments using btree (tokenization_id) TABLESPACE pg_default;

create trigger investment_activity_trigger
after
update on investments for EACH row
execute FUNCTION log_investment_activity ();

-- Chat rooms with enhanced features
CREATE TABLE chat_rooms (
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
CREATE TABLE chat_participants (
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
CREATE TABLE chat_messages (
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
CREATE TABLE governance_proposals (
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
CREATE TABLE votes (
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

-- Wallets (enhanced)
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_type TEXT NOT NULL, -- custodial, external, hardware
  wallet_name TEXT, -- user-defined name
  hedera_account_id TEXT UNIQUE,
  private_key_encrypted TEXT, -- only for custodial wallets
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
CREATE TABLE token_holdings (
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
CREATE TABLE activity_logs (
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
CREATE TABLE notifications (
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
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Dividend distributions
CREATE TABLE dividend_distributions (
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
CREATE TABLE dividend_payments (
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
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT, -- number, string, boolean, json
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- can be accessed by frontend
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_hedera_account ON users(hedera_account_id);
CREATE INDEX idx_properties_status ON properties(approval_status, listing_status);
CREATE INDEX idx_properties_location ON properties USING GIN(location);
CREATE INDEX idx_tokenizations_status ON tokenizations(status);
CREATE INDEX idx_tokenizations_window ON tokenizations(investment_window_start, investment_window_end);
CREATE INDEX idx_investments_investor ON investments(investor_id);
CREATE INDEX idx_investments_tokenization ON investments(tokenization_id);
CREATE INDEX idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id, created_at);
CREATE INDEX idx_governance_proposals_property ON governance_proposals(property_id);
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_token_holdings_user ON token_holdings(user_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);




create view public.user_chat_rooms_with_last_message as
select
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
    select
      count(*) as count
    from
      chat_messages cm2
    where
      cm2.room_id = cp.room_id
      and cm2.created_at > COALESCE(
        cp.last_seen_at,
        '1970-01-01 00:00:00'::timestamp without time zone
      )
  ) as unread_count
from
  chat_participants cp
  join chat_rooms cr on cp.room_id = cr.id
  left join properties p on cr.property_id = p.id
  left join tokenizations t on cr.tokenization_id = t.id
  left join lateral (
    select
      cm.message_text,
      cm.created_at,
      cm.message_type,
      cm.sender_id
    from
      chat_messages cm
    where
      cm.room_id = cp.room_id
    order by
      cm.created_at desc
    limit
      1
  ) lm on true
  left join users u on lm.sender_id = u.id;