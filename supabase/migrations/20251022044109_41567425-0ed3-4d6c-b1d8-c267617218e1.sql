-- Create function to get document by document number for verification
CREATE OR REPLACE FUNCTION get_document_by_number(doc_number TEXT)
RETURNS TABLE (
  document_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  version INTEGER,
  is_current BOOLEAN,
  document_hash TEXT,
  hcs_verification_id TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id.document_type,
    id.created_at,
    id.version,
    id.is_current,
    id.document_hash,
    id.hcs_verification_id
  FROM investment_documents id
  WHERE id.document_number = doc_number;
END;
$$;