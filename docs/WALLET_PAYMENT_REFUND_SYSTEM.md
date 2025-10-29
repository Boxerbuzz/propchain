# Wallet Payment & Refund System Implementation

## Overview

This document describes the comprehensive fix to the wallet payment and refund system, addressing critical architectural flaws where wallet payments did not execute actual cryptocurrency transfers on the Hedera network.

## What Was Fixed

### Phase 1: Real Crypto Transfers for Wallet Payments ✅

**Problem:** `deduct-wallet-balance` only updated database field `balance_ngn` without executing any Hedera transaction. User's HBAR remained untouched.

**Solution:** Created `execute-wallet-payment` edge function that:
- Retrieves user's private key securely from Vault
- Executes actual HBAR `TransferTransaction` from user to platform treasury
- Tracks transaction ID for audit trail
- Updates investment record with crypto payment details
- Syncs wallet balance after transfer

**New Columns in `investments` table:**
- `crypto_amount_paid` - Actual HBAR/USDC amount
- `crypto_currency` - 'HBAR' or 'USDC'
- `payment_tx_id` - Hedera transaction ID
- `refund_tx_reference` - Paystack or Hedera refund reference
- `refunded_at` - Timestamp of refund

### Phase 2: Fixed Wallet Funding Sync ✅

**Problem:** `paystack-webhook` manually updated `balance_ngn` after HBAR transfer, which was then overwritten by `sync-wallet-balance`.

**Solution:** Modified `paystack-webhook` to:
- Remove manual `balance_ngn` update
- Call `sync-wallet-balance` after HBAR transfer
- Let sync calculate accurate balances from Hedera state

### Phase 3: Payment-Method-Aware Refunds ✅

**Problem:** All refunds went to `balance_ngn` regardless of payment method.

**Solution:** Created `process-smart-refunds` edge function that:
- **Paystack payments**: Refunds via Paystack API to original card/bank
- **Wallet payments**: Transfers HBAR back from platform treasury to user's Hedera account
- Logs detailed activity for each refund type
- Sends appropriate notifications to users

## Architecture Flow

### Wallet Payment Flow (NEW)
```
1. User selects "Pay with Wallet"
2. create-investment calls execute-wallet-payment
3. execute-wallet-payment:
   - Fetches user's private key from Vault
   - Calculates HBAR amount at live exchange rate
   - Executes TransferTransaction on Hedera (user → treasury)
   - Updates investment with tx_id, crypto_amount_paid
   - Triggers sync-wallet-balance
   - Calls process-investment-completion
4. Investment confirmed with on-chain proof
```

### Paystack Payment Flow (UNCHANGED)
```
1. User selects "Pay with Card"
2. create-investment initializes Paystack payment
3. User completes payment on Paystack
4. paystack-webhook receives confirmation
5. Investment marked as confirmed
6. process-investment-completion called
```

### Refund Flow (NEW)
```
For Paystack payments:
1. process-smart-refunds detects refund_pending
2. Calls Paystack API to refund to card/bank
3. Updates investment.refund_tx_reference with Paystack refund ID
4. Sends notification: "Refund will arrive in 5-7 days"

For Wallet payments:
1. process-smart-refunds detects refund_pending
2. Transfers HBAR from treasury → user's Hedera account
3. Updates investment.refund_tx_reference with Hedera tx ID
4. Syncs user's wallet balance
5. Sends notification: "HBAR refunded to your wallet"
```

## Edge Functions

### New Functions
1. **execute-wallet-payment** - Processes crypto transfers from user wallets
2. **process-smart-refunds** - Handles payment-method-aware refunds

### Modified Functions
1. **create-investment** - Now calls `execute-wallet-payment` instead of `deduct-wallet-balance`
2. **paystack-webhook** - Now calls `sync-wallet-balance` instead of manual update

### Deprecated Functions
- **deduct-wallet-balance** - No longer used (kept for backward compatibility)
- **process-refunds** - Replaced by `process-smart-refunds`

## Database Schema Updates

```sql
-- New columns in investments table
ALTER TABLE investments
ADD COLUMN crypto_amount_paid NUMERIC,
ADD COLUMN crypto_currency TEXT CHECK (crypto_currency IN ('HBAR', 'USDC')),
ADD COLUMN payment_tx_id TEXT,
ADD COLUMN refund_tx_reference TEXT,
ADD COLUMN refunded_at TIMESTAMP;

-- Backfilled payment_method for existing records
UPDATE investments
SET payment_method = CASE
  WHEN paystack_reference IS NOT NULL THEN 'paystack'
  ELSE 'wallet'
END
WHERE payment_method IS NULL;
```

## Platform Treasury Account Setup

**CRITICAL:** The system requires a dedicated Hedera treasury account to receive wallet payments and process refunds.

### Current Configuration
- Treasury account is currently using the operator account: `HEDERA_OPERATOR_ID`
- Private key: `HEDERA_OPERATOR_PRIVATE_KEY`

### Production Setup (TODO)
1. Create a dedicated Hedera account for treasury operations
2. Store account ID in environment variable: `HEDERA_TREASURY_ACCOUNT_ID`
3. Store private key in Vault
4. Update `execute-wallet-payment` and `process-smart-refunds` to use treasury account

## Security Considerations

### User Private Keys
- Private keys are retrieved from Vault using `get_wallet_private_key()` RPC
- Keys are never logged or stored in plaintext
- Keys are only used to sign transactions and immediately discarded

### Transaction Signing
- User consent is implicit through wallet payment selection
- All transactions are logged with full audit trail
- Failed transactions trigger automatic rollback

### Exchange Rate Risks
- Exchange rates are locked at payment time
- Rates stored in `investments.exchange_rate` for transparency
- Refunds use original crypto amount, not re-calculated

## Testing Checklist

- [ ] User funds wallet via Paystack → HBAR transferred and balance synced
- [ ] User invests via wallet → HBAR deducted on Hedera, tx_id recorded
- [ ] Investment fails (Paystack) → Paystack API refund processed
- [ ] Investment fails (Wallet) → HBAR returned to user's account
- [ ] sync-wallet-balance doesn't overwrite legitimate wallet payments
- [ ] Notifications sent correctly for each refund type
- [ ] Activity logs created for all payment/refund events

## Known Limitations

1. **USDC Support:** Framework exists but not fully implemented
2. **Exchange Rate Source:** Currently uses CoinGecko with fallback, consider paid API for production
3. **Treasury Reconciliation:** Manual reconciliation needed if DB update fails after Hedera transfer
4. **Paystack Refund Timing:** Refunds take 5-7 business days (Paystack limitation)

## Future Enhancements

1. Implement USDC payment support
2. Add dedicated treasury management dashboard
3. Automated treasury balance monitoring and alerts
4. Support for partial refunds
5. Multi-signature treasury for enhanced security
6. Real-time exchange rate locking mechanism

## Rollback Plan

If critical issues arise:
1. Disable wallet payment option in frontend
2. Force all new investments to use Paystack
3. Process pending refunds manually
4. Investigate and fix issues before re-enabling

## Support & Troubleshooting

### Common Issues

**Issue:** "Insufficient HBAR balance" error during wallet payment
- **Cause:** User's Hedera account doesn't have enough HBAR
- **Solution:** User must fund wallet via Paystack first

**Issue:** Transaction succeeds but DB update fails
- **Cause:** Database connection issue after Hedera transfer
- **Solution:** Check `activity_logs` for `payment_reconciliation_needed` entries, manually update investment

**Issue:** Refund not appearing in user wallet
- **Cause:** Sync hasn't run yet
- **Solution:** Trigger manual sync via `sync-wallet-balance`

### Logs & Debugging
- Check edge function logs for `[WALLET-PAYMENT]`, `[SMART-REFUNDS]`, `[WALLET-FUNDING]` prefixes
- Review `activity_logs` table for payment/refund events
- Check Hedera Mirror Node for transaction confirmation

## Contact

For technical questions or issues with this implementation, consult the system documentation or review the edge function logs.
