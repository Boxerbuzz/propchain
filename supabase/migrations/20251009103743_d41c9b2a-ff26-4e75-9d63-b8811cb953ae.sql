-- Add tokenization_type column to tokenizations table
ALTER TABLE tokenizations 
ADD COLUMN tokenization_type text NOT NULL DEFAULT 'equity';

-- Add check constraint for valid tokenization types
ALTER TABLE tokenizations 
ADD CONSTRAINT valid_tokenization_type 
CHECK (tokenization_type IN ('equity', 'debt', 'revenue'));

-- Add type-specific metadata columns
-- For Debt tokenizations
ALTER TABLE tokenizations 
ADD COLUMN interest_rate numeric,
ADD COLUMN ltv_ratio numeric,
ADD COLUMN loan_term_months integer;

-- For Revenue tokenizations
ALTER TABLE tokenizations 
ADD COLUMN revenue_share_percentage numeric;

-- For all types (additional metadata)
ALTER TABLE tokenizations 
ADD COLUMN type_specific_terms jsonb DEFAULT '{}'::jsonb;

-- Create index for faster filtering by type
CREATE INDEX idx_tokenizations_type ON tokenizations(tokenization_type);

-- Add comment for documentation
COMMENT ON COLUMN tokenizations.tokenization_type IS 'Type of tokenization: equity (ownership), debt (lending), or revenue (income sharing)';
COMMENT ON COLUMN tokenizations.interest_rate IS 'Annual interest rate for debt tokenizations (percentage)';
COMMENT ON COLUMN tokenizations.ltv_ratio IS 'Loan-to-value ratio for debt tokenizations (percentage)';
COMMENT ON COLUMN tokenizations.loan_term_months IS 'Loan term in months for debt tokenizations';
COMMENT ON COLUMN tokenizations.revenue_share_percentage IS 'Percentage of revenue shared with investors for revenue tokenizations';
COMMENT ON COLUMN tokenizations.type_specific_terms IS 'Additional type-specific terms and conditions (JSON)';