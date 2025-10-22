-- Phase 1: Add versioning to investment_documents table
ALTER TABLE investment_documents 
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS version_date TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS superseded_by UUID REFERENCES investment_documents(id),
  ADD COLUMN IF NOT EXISTS reason_for_update TEXT,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_investment_documents_current 
  ON investment_documents(investment_id, document_type, is_current);

CREATE INDEX IF NOT EXISTS idx_investment_documents_version
  ON investment_documents(investment_id, version DESC);

-- Phase 2: Create token transfers table
CREATE TABLE IF NOT EXISTS token_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenization_id UUID REFERENCES tokenizations(id) NOT NULL,
  from_user_id UUID REFERENCES users(id) NOT NULL,
  to_user_id UUID REFERENCES users(id) NOT NULL,
  tokens_transferred BIGINT NOT NULL,
  transfer_price_per_token DECIMAL,
  total_transfer_value DECIMAL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('sale', 'gift', 'inheritance', 'transfer')),
  hedera_transaction_id TEXT,
  transfer_date TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_transfers_from_user ON token_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transfers_to_user ON token_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transfers_tokenization ON token_transfers(tokenization_id);
CREATE INDEX IF NOT EXISTS idx_token_transfers_status ON token_transfers(status);

-- Add RLS policies for token_transfers
ALTER TABLE token_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transfers"
  ON token_transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can initiate transfers"
  ON token_transfers FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Service role can manage transfers"
  ON token_transfers FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Phase 3: Create document versioning function
CREATE OR REPLACE FUNCTION create_new_document_version(
  p_old_document_id UUID,
  p_new_document_url TEXT,
  p_reason TEXT,
  p_new_user_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_doc_id UUID;
  v_old_doc RECORD;
BEGIN
  -- Get old document details
  SELECT * INTO v_old_doc
  FROM investment_documents
  WHERE id = p_old_document_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found';
  END IF;

  -- Mark old document as superseded
  UPDATE investment_documents
  SET 
    is_current = FALSE,
    updated_at = NOW()
  WHERE id = p_old_document_id;

  -- Create new version
  INSERT INTO investment_documents (
    investment_id,
    user_id,
    tokenization_id,
    property_id,
    document_type,
    document_url,
    document_number,
    metadata,
    version,
    version_date,
    reason_for_update,
    is_current
  )
  VALUES (
    v_old_doc.investment_id,
    COALESCE(p_new_user_id, v_old_doc.user_id),
    v_old_doc.tokenization_id,
    v_old_doc.property_id,
    v_old_doc.document_type,
    p_new_document_url,
    v_old_doc.document_number || '-V' || (v_old_doc.version + 1),
    jsonb_set(
      COALESCE(v_old_doc.metadata, '{}'::jsonb),
      '{previous_version_id}',
      to_jsonb(p_old_document_id::text)
    ),
    v_old_doc.version + 1,
    NOW(),
    p_reason,
    TRUE
  )
  RETURNING id INTO v_new_doc_id;

  -- Link old to new
  UPDATE investment_documents
  SET superseded_by = v_new_doc_id
  WHERE id = p_old_document_id;

  RETURN v_new_doc_id;
END;
$$;

-- Phase 4: Create function to handle document generation on transfer
CREATE OR REPLACE FUNCTION generate_transfer_documents(
  p_transfer_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transfer RECORD;
  v_result JSONB;
BEGIN
  -- Get transfer details
  SELECT * INTO v_transfer
  FROM token_transfers
  WHERE id = p_transfer_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Transfer not found');
  END IF;

  -- This will be called by the edge function to trigger document generation
  -- Return transfer details for processing
  RETURN jsonb_build_object(
    'success', true,
    'transfer_id', v_transfer.id,
    'from_user_id', v_transfer.from_user_id,
    'to_user_id', v_transfer.to_user_id,
    'tokens_transferred', v_transfer.tokens_transferred
  );
END;
$$;