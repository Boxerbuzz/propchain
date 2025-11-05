-- Add associated_tokens column to wallets table
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS associated_tokens JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN wallets.associated_tokens IS 'Array of Hedera tokens associated with this wallet, including balance and metadata from mirror node';