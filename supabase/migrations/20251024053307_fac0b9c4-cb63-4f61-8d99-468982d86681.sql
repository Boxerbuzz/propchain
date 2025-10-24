-- Drop the old check constraint
ALTER TABLE investment_documents 
DROP CONSTRAINT investment_documents_document_type_check;

-- Add new check constraint that includes 'certificate'
ALTER TABLE investment_documents 
ADD CONSTRAINT investment_documents_document_type_check 
CHECK (document_type IN ('agreement', 'receipt', 'certificate'));