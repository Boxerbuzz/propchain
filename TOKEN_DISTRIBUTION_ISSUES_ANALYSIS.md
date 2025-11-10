# Token Distribution Issues - Investigation Report

## Summary
Investigation into why some investors don't receive tokens while others receive tokens multiple times during token distribution.

## Critical Issues Found

### 1. **CRITICAL: Token Holdings Balance Replacement Instead of Addition**
**Location:** `supabase/functions/distribute-tokens-to-kyc-users/index.ts:666-677`

**Problem:**
```typescript
await supabase.from("token_holdings").upsert(
  {
    user_id: userId,
    tokenization_id,
    property_id: tokenization.property_id,
    balance: Number(agg.total_tokens_requested), // ❌ REPLACES balance instead of adding
    updated_at: new Date().toISOString(),
  },
  {
    onConflict: "user_id,tokenization_id",
  }
);
```

**Impact:**
- If a user has existing tokens (e.g., 100 tokens from a previous investment), and receives 50 more tokens, the database will show 50 tokens instead of 150.
- This causes **under-counting** in the database, even though the on-chain balance might be correct.
- Affects dividend distributions, voting power calculations, and portfolio tracking.

**Expected Behavior:**
There's a database function `upsert_token_holdings` in `migration/db-functions.sql:404-444` that correctly adds to balance:
```sql
ON CONFLICT (user_id, tokenization_id)
DO UPDATE SET
  balance = token_holdings.balance + p_tokens_to_add, -- ✅ Correctly adds
  ...
```
But the distribution function is NOT using this - it's doing a direct upsert which replaces the balance.

---

### 2. **Race Condition: Multiple Concurrent Distributions**
**Location:** `supabase/functions/distribute-tokens-to-kyc-users/index.ts:648-656`

**Problem:**
```typescript
const { error: updateError } = await supabase
  .from("investments")
  .update({
    payment_status: "tokens_distributed",
    ...
  })
  .in("id", agg.investment_ids)
  .eq("payment_status", "confirmed"); // ❌ Race condition window
```

**Impact:**
- If two distribution processes run concurrently (or close together), both could see investments with `payment_status = 'confirmed'`.
- Both processes could:
  1. Query the same investments (line 176: `.eq("payment_status", "confirmed")`)
  2. Both calculate tokens needed
  3. Both transfer tokens on-chain (causing double distribution)
  4. Both try to update status, but the second one won't update anything (no rows match after first update)

**Scenario:**
1. Distribution A starts, queries investments with status 'confirmed'
2. Distribution B starts (before A finishes), also queries investments with status 'confirmed'
3. Both see the same investments
4. Both transfer tokens → **User receives tokens twice**
5. Distribution A updates status to 'tokens_distributed'
6. Distribution B tries to update, but finds no rows (status already changed) → Updates nothing

**Mitigation Attempt:**
- There's a lock mechanism (lines 66-108), but:
  - Lock expires after 10 minutes
  - If lock acquisition fails, it deletes and retries (line 99-107), which could allow concurrent runs
  - Lock is released on error (line 808-811), which could allow retries while another process is running

---

### 3. **Incorrect Token Amount Calculation for Users with Existing Holdings**
**Location:** `supabase/functions/distribute-tokens-to-kyc-users/index.ts:521-525`

**Problem:**
```typescript
// Calculate tokens to transfer (idempotent: only send the delta)
const tokensToTransfer =
  agg.total_tokens_requested > currentBalance
    ? agg.total_tokens_requested - currentBalance
    : 0n;
```

**Issue:**
- `agg.total_tokens_requested` (line 254) is calculated from ALL confirmed investments for the user:
  ```typescript
  agg.total_tokens_requested += BigInt(inv.tokens_requested);
  ```
- But the query (line 176) only gets investments with `payment_status = 'confirmed'`
- If an investment was already distributed (status = 'tokens_distributed') but the on-chain balance doesn't reflect it yet (e.g., transaction pending), the calculation could be wrong.

**Scenario:**
1. User has Investment #1: 100 tokens (status: 'confirmed')
2. Distribution runs, transfers 100 tokens, updates status to 'tokens_distributed'
3. User makes Investment #2: 50 tokens (status: 'confirmed')
4. Before Investment #2 is distributed, user's on-chain balance shows 100 tokens
5. Distribution runs again, sees:
   - `agg.total_tokens_requested = 50` (only Investment #2, since #1 is now 'tokens_distributed')
   - `currentBalance = 100` (on-chain)
   - `tokensToTransfer = 0` (50 < 100) → **No tokens transferred!**

**However**, if Investment #1's status update failed (database error), both investments would be in the query:
- `agg.total_tokens_requested = 150` (100 + 50)
- `currentBalance = 100` (on-chain)
- `tokensToTransfer = 50` → Correct amount, but Investment #1's status might not get updated properly

---

### 4. **Multiple Distribution Triggers for Same Investment**
**Location:** 
- `supabase/functions/process-investment-completion/index.ts:230-237`
- `supabase/functions/paystack-webhook/index.ts:67-70`

**Problem:**
- When an investment payment is confirmed, `process-investment-completion` is triggered
- This function then triggers `distribute-tokens-to-kyc-users` for that specific user (line 230-237)
- If the webhook is called multiple times (Paystack retries, manual triggers), or if `process-investment-completion` is called multiple times, distribution could be triggered multiple times for the same investment.

**Impact:**
- If the status update (line 648-656) fails or is delayed, the investment remains with status 'confirmed'
- Subsequent triggers would see it as needing distribution again
- Could lead to multiple token transfers

---

### 5. **Reconciliation Function Could Cause Duplicate Distributions**
**Location:** `supabase/functions/reconcile-token-distributions/index.ts:141-146`

**Problem:**
- The reconciliation function queries investments with `payment_status = 'confirmed'` (line 73)
- It then triggers distribution for users with shortfalls
- If reconciliation runs while a regular distribution is in progress, both could process the same investments

**Scenario:**
1. Regular distribution starts, queries confirmed investments
2. Reconciliation runs simultaneously, also queries confirmed investments
3. Both see the same investments
4. Both trigger distributions → Duplicate transfers

---

### 6. **Status Update Failure Doesn't Prevent Re-processing**
**Location:** `supabase/functions/distribute-tokens-to-kyc-users/index.ts:648-663`

**Problem:**
```typescript
const { error: updateError } = await supabase
  .from("investments")
  .update({ payment_status: "tokens_distributed", ... })
  .in("id", agg.investment_ids)
  .eq("payment_status", "confirmed");

if (updateError) {
  console.error("[DISTRIBUTE-TOKENS] Failed to update investments:", updateError);
  // ❌ Error is logged but processing continues
}
```

**Impact:**
- If the status update fails (database error, constraint violation, etc.), the investment remains with status 'confirmed'
- Tokens were already transferred on-chain
- Next distribution run will see this investment again and try to distribute again
- User receives tokens multiple times

---

### 7. **Investment Aggregation Doesn't Account for Already Distributed Investments**
**Location:** `supabase/functions/distribute-tokens-to-kyc-users/index.ts:233-257`

**Problem:**
- The aggregation (line 254) adds up tokens from ALL investments in the query result
- The query (line 176) only gets investments with `payment_status = 'confirmed'`
- However, if an investment was partially processed (tokens transferred but status not updated), it could be counted multiple times

**Better Approach:**
- Should exclude investments that have successful distribution events in `token_distribution_events`
- Or use a more robust status check that considers distribution events

---

## Recommended Fixes

### Fix 1: Use Database Function for Token Holdings Update
Replace the direct upsert with a call to the database function that correctly adds to balance:

```typescript
// Instead of direct upsert, use the database function
await supabase.rpc('upsert_token_holdings', {
  p_user_id: userId,
  p_tokenization_id: tokenization_id,
  p_property_id: tokenization.property_id,
  p_token_id: tokenization.token_id,
  p_tokens_to_add: Number(agg.total_tokens_requested), // Amount to ADD
  p_amount_invested: agg.investments.reduce((sum, inv) => sum + inv.amount_ngn, 0)
});
```

### Fix 2: Add Transaction/Atomic Status Update
Use a database transaction or check distribution events before updating:

```typescript
// Check if investment was already distributed
const { data: existingEvents } = await supabase
  .from('token_distribution_events')
  .select('investment_id, status')
  .in('investment_id', agg.investment_ids)
  .eq('status', 'success');

const alreadyDistributed = new Set(existingEvents?.map(e => e.investment_id) || []);
const toUpdate = agg.investment_ids.filter(id => !alreadyDistributed.has(id));

if (toUpdate.length > 0) {
  await supabase
    .from("investments")
    .update({ payment_status: "tokens_distributed", ... })
    .in("id", toUpdate)
    .eq("payment_status", "confirmed");
}
```

### Fix 3: Improve Lock Mechanism
- Use database-level locks (SELECT FOR UPDATE) instead of application-level locks
- Add retry logic with exponential backoff
- Ensure lock is held for the entire distribution process

### Fix 4: Idempotency Check Before Distribution
Check distribution events before processing:

```typescript
// Before processing, check if already distributed
const { data: existingDistributions } = await supabase
  .from('token_distribution_events')
  .select('investment_id, status, tokens_transferred')
  .in('investment_id', agg.investment_ids)
  .eq('status', 'success');

// Filter out already distributed investments
const distributedIds = new Set(existingDistributions?.map(d => d.investment_id) || []);
const pendingInvestments = investments.filter(inv => !distributedIds.has(inv.id));
```

### Fix 5: Calculate Expected Balance from Database
Instead of relying solely on on-chain balance, also check what the database says the user should have:

```typescript
// Get expected balance from database (sum of all confirmed investments)
const { data: dbHoldings } = await supabase
  .from('token_holdings')
  .select('balance')
  .eq('user_id', userId)
  .eq('tokenization_id', tokenization_id)
  .single();

const expectedBalanceFromDB = dbHoldings?.balance || 0;
const expectedBalanceFromInvestments = Number(agg.total_tokens_requested);

// Use the higher of the two, or reconcile the difference
```

### Fix 6: Add Distribution Event Before Token Transfer
Log the distribution event BEFORE transferring tokens, so if the transfer fails, we can track it:

```typescript
// Log distribution attempt BEFORE transfer
await supabase.from("token_distribution_events").insert({
  tokenization_id,
  user_id: userId,
  investment_id: inv.id,
  tokens_requested: inv.tokens_requested,
  status: "processing", // New status
  ...
});

// Then do the transfer
// Then update status to "success" or "failed"
```

---

## Testing Recommendations

1. **Test Concurrent Distributions:**
   - Trigger two distributions simultaneously for the same tokenization
   - Verify no duplicate transfers occur
   - Verify status updates correctly

2. **Test Existing Holdings:**
   - User with existing tokens makes a new investment
   - Verify new tokens are added, not replaced
   - Verify database balance matches on-chain balance

3. **Test Status Update Failure:**
   - Simulate database error during status update
   - Verify tokens are not distributed again on retry
   - Verify distribution events are logged correctly

4. **Test Partial Failures:**
   - Multiple investments, some succeed, some fail
   - Verify only successful ones are marked as distributed
   - Verify failed ones can be retried

5. **Test Reconciliation:**
   - Run reconciliation while distribution is in progress
   - Verify no duplicate distributions
   - Verify correct final state

---

## Conclusion

The main issues are:
1. **Token holdings balance is replaced instead of added** (Critical - affects all users with multiple investments)
2. **Race conditions allow concurrent distributions** (High - causes duplicate distributions)
3. **Status update failures allow re-processing** (High - causes duplicate distributions)
4. **Multiple triggers for same investment** (Medium - depends on webhook behavior)

The most critical fix is #1 (token holdings balance), as it affects database consistency and all downstream calculations (dividends, voting, portfolio).

