-- Add currency support columns to withdrawal_requests table
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS currency_type TEXT DEFAULT 'ngn',
ADD COLUMN IF NOT EXISTS currency_amount NUMERIC;

-- Add currency support to investments table
ALTER TABLE investments
ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'ngn';

-- Add comment for documentation
COMMENT ON COLUMN withdrawal_requests.currency_type IS 'Currency type: ngn, hbar, or usdc';
COMMENT ON COLUMN withdrawal_requests.currency_amount IS 'Amount in the selected cryptocurrency';
COMMENT ON COLUMN investments.payment_currency IS 'Currency used for payment: ngn, hbar, or usdc';