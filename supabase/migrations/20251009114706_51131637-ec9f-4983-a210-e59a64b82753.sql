-- Add terms acceptance tracking to tokenizations table
ALTER TABLE tokenizations
ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN terms_version TEXT DEFAULT '1.0';

-- Add terms acceptance tracking to investments table
ALTER TABLE investments
ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN terms_version TEXT DEFAULT '1.0';

-- Add comment explaining the columns
COMMENT ON COLUMN tokenizations.terms_accepted_at IS 'Timestamp when property owner accepted tokenization terms';
COMMENT ON COLUMN tokenizations.terms_version IS 'Version of terms accepted by property owner';
COMMENT ON COLUMN investments.terms_accepted_at IS 'Timestamp when investor accepted investment terms';
COMMENT ON COLUMN investments.terms_version IS 'Version of terms accepted by investor';