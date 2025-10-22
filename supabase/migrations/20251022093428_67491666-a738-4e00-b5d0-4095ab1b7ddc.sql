-- Add treasury_type column to tokenizations table
ALTER TABLE tokenizations 
ADD COLUMN IF NOT EXISTS treasury_type TEXT DEFAULT 'multisig' CHECK (treasury_type IN ('custodial', 'multisig'));

-- Add comment for clarity
COMMENT ON COLUMN tokenizations.treasury_type IS 'Type of treasury: custodial (platform holds keys) or multisig (smart contract)';

-- Create index for treasury queries
CREATE INDEX IF NOT EXISTS idx_tokenizations_treasury_type ON tokenizations(treasury_type);

-- Add treasury_signers_count for quick lookup
ALTER TABLE tokenizations
ADD COLUMN IF NOT EXISTS treasury_signers_count INTEGER DEFAULT 3;

COMMENT ON COLUMN tokenizations.treasury_signers_count IS 'Number of authorized signers for multisig treasury';