-- Create kyc_drafts table for temporary KYC data storage
CREATE TABLE public.kyc_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Step tracking
  current_step TEXT NOT NULL DEFAULT 'document_type',
  completed_steps TEXT[] DEFAULT '{}',
  
  -- Form data stored as JSONB
  form_data JSONB NOT NULL DEFAULT '{}',
  
  -- File URLs
  document_image_url TEXT,
  selfie_url TEXT,
  proof_of_address_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'), -- Auto-expire after 7 days
  
  -- Constraints
  CONSTRAINT kyc_drafts_user_id_key UNIQUE(user_id) -- One draft per user
);

-- Index for performance
CREATE INDEX idx_kyc_drafts_user_id ON kyc_drafts(user_id);
CREATE INDEX idx_kyc_drafts_expires_at ON kyc_drafts(expires_at);

-- Function to auto-cleanup expired drafts
CREATE OR REPLACE FUNCTION cleanup_expired_kyc_drafts()
RETURNS void AS $$
BEGIN
  DELETE FROM kyc_drafts WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if using pg_cron)
-- SELECT cron.schedule('cleanup-kyc-drafts', '0 2 * * *', 'SELECT cleanup_expired_kyc_drafts();');
