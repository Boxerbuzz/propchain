-- Fix search_path security issue for get_document_by_number function
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
SET search_path = public
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