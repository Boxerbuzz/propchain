-- Phase 1: Add missing treasury columns to tokenizations table

-- Add treasury_signers array column to store user IDs of authorized signers
ALTER TABLE tokenizations 
ADD COLUMN IF NOT EXISTS treasury_signers UUID[] DEFAULT '{}';

COMMENT ON COLUMN tokenizations.treasury_signers IS 'Array of user IDs authorized to sign treasury transactions';

-- Add treasury_threshold column to specify number of approvals required
ALTER TABLE tokenizations
ADD COLUMN IF NOT EXISTS treasury_threshold INTEGER DEFAULT 2;

COMMENT ON COLUMN tokenizations.treasury_threshold IS 'Number of signer approvals required to execute withdrawal (e.g., 2 for 2-of-3 multisig)';

-- Add constraint: threshold must be positive and cannot exceed signers count
ALTER TABLE tokenizations
ADD CONSTRAINT treasury_threshold_valid 
CHECK (treasury_threshold > 0 AND treasury_threshold <= treasury_signers_count);

-- Create GIN index for efficient signer lookups
CREATE INDEX IF NOT EXISTS idx_tokenizations_treasury_signers 
ON tokenizations USING GIN (treasury_signers);

-- Add treasury_hedera_signers array to store Hedera account IDs (parallel to treasury_signers)
ALTER TABLE tokenizations
ADD COLUMN IF NOT EXISTS treasury_hedera_signers TEXT[] DEFAULT '{}';

COMMENT ON COLUMN tokenizations.treasury_hedera_signers IS 'Array of Hedera account IDs corresponding to treasury_signers for smart contract operations';