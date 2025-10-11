-- Add USDC association tracking to wallets table
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS usdc_associated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS usdc_associated_at TIMESTAMP;

-- Add auto_processed flag for withdrawal_requests
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS auto_processed BOOLEAN DEFAULT FALSE;

-- Add helpful comment
COMMENT ON COLUMN wallets.usdc_associated IS 'Tracks if USDC token has been associated with this Hedera account';
COMMENT ON COLUMN wallets.usdc_associated_at IS 'Timestamp when USDC was first associated';
COMMENT ON COLUMN withdrawal_requests.auto_processed IS 'Indicates if withdrawal was auto-approved for KYC users';