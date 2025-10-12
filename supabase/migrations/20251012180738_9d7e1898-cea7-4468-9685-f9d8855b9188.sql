-- Add use of funds columns to tokenizations table
ALTER TABLE tokenizations
ADD COLUMN IF NOT EXISTS use_of_funds JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS use_of_funds_breakdown JSONB;

-- Add comment explaining the structure
COMMENT ON COLUMN tokenizations.use_of_funds IS 'Array of fund allocation objects: [{category: string, amount_ngn: number, percentage: number, description: string}]';
COMMENT ON COLUMN tokenizations.use_of_funds_breakdown IS 'Additional breakdown metadata for fund allocation analysis';