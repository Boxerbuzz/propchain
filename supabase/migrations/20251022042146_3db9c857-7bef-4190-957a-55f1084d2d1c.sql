-- Add document verification columns to investment_documents
ALTER TABLE investment_documents 
  ADD COLUMN IF NOT EXISTS document_hash TEXT,
  ADD COLUMN IF NOT EXISTS hcs_verification_id TEXT,
  ADD COLUMN IF NOT EXISTS qr_code_data TEXT;

-- Add index on document_hash for quick verification lookups
CREATE INDEX IF NOT EXISTS idx_investment_documents_hash ON investment_documents(document_hash);

-- Add index on document_number for verification page
CREATE INDEX IF NOT EXISTS idx_investment_documents_number ON investment_documents(document_number);