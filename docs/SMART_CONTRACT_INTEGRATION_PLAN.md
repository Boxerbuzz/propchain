# Hedera Smart Contract Integration Plan
## Hybrid Architecture for Real Estate Tokenization Platform

---

## 1. Architecture Overview

### Current System (HTS-Based)
- **Hedera Token Service (HTS)** for property tokens
- **Edge Functions** for all business logic
- **Supabase Database** for state management
- **Centralized control** via service role

### Target Hybrid System
- **Keep HTS tokens** for property tokenization (no change)
- **Add Smart Contracts** for financial logic:
  - Investment escrow & refunds
  - Dividend distribution automation
  - Governance voting
  - Withdrawal security (multi-sig, time-locks)
- **Edge Functions** for UI/UX, DB operations, HCS messaging, KYC
- **Trustless & Transparent** on-chain financial operations

---

## 2. Smart Contract Components

### 2.1 Platform Escrow Manager Contract (Core)
**Purpose:** Single platform-level contract managing all property investment escrows

**Key Functions:**
```solidity
// Register a new tokenization campaign
function registerTokenization(
    string memory propertyId,
    address tokenId,  // HTS token address
    uint256 minimumRaise,
    uint256 targetRaise,
    uint256 investmentWindowEnd
) external onlyOwner returns (uint256 campaignId)

// Investor deposits funds
function depositInvestment(
    uint256 campaignId,
    uint256 amountNgn
) external payable

// Check if minimum raise met (called at window end)
function finalizeCampaign(uint256 campaignId) external

// Automatic refund if campaign failed
function claimRefund(uint256 campaignId) external

// Release funds to property owner if successful
function releaseFunds(uint256 campaignId) external onlyOwner
```

**Events:**
- `CampaignRegistered(uint256 campaignId, string propertyId)`
- `InvestmentDeposited(uint256 campaignId, address investor, uint256 amount)`
- `CampaignFinalized(uint256 campaignId, bool successful, uint256 totalRaised)`
- `RefundProcessed(uint256 campaignId, address investor, uint256 amount)`
- `FundsReleased(uint256 campaignId, uint256 amount)`

### 2.2 Dividend Distribution Contract
**Purpose:** Automated, transparent dividend distribution to token holders

**Key Functions:**
```solidity
// Create dividend distribution
function createDistribution(
    address tokenId,  // HTS token
    uint256 totalAmount,
    uint256 distributionDate
) external onlyOwner returns (uint256 distributionId)

// Token holders claim dividends
function claimDividend(uint256 distributionId) external

// Batch process dividends (automated)
function batchProcessDividends(
    uint256 distributionId,
    address[] calldata recipients
) external onlyOwner
```

**Events:**
- `DistributionCreated(uint256 distributionId, address tokenId, uint256 amount)`
- `DividendClaimed(uint256 distributionId, address recipient, uint256 amount)`
- `DividendProcessed(uint256 distributionId, uint256 successCount, uint256 failCount)`

### 2.3 Governance Contract
**Purpose:** On-chain voting for property decisions

**Key Functions:**
```solidity
// Create proposal
function createProposal(
    address tokenId,
    string memory title,
    string memory description,
    uint256 votingEndTime
) external returns (uint256 proposalId)

// Cast vote (voting power = token balance)
function vote(
    uint256 proposalId,
    bool support
) external

// Execute proposal if passed
function executeProposal(uint256 proposalId) external
```

**Events:**
- `ProposalCreated(uint256 proposalId, address tokenId, address proposer)`
- `VoteCast(uint256 proposalId, address voter, bool support, uint256 votingPower)`
- `ProposalExecuted(uint256 proposalId, bool passed)`

### 2.4 Multi-Sig Withdrawal Contract
**Purpose:** Secure withdrawal mechanism with multi-signature approval

**Key Functions:**
```solidity
// Initiate withdrawal
function initiateWithdrawal(
    address recipient,
    uint256 amount,
    string memory reason
) external returns (uint256 withdrawalId)

// Approve withdrawal (requires N of M signatures)
function approveWithdrawal(uint256 withdrawalId) external

// Execute approved withdrawal
function executeWithdrawal(uint256 withdrawalId) external
```

---

## 3. Integration with Existing System

### 3.1 Investment Flow (Hybrid)

**Current Flow:**
```
User → create-investment edge function → Reserve tokens → Paystack/Wallet payment → Confirm investment
```

**New Hybrid Flow:**
```
User → create-investment edge function → Smart Contract Escrow Deposit → Reserve tokens → Payment confirmation → Update DB
                                                ↓
                                        (Funds held in contract)
                                                ↓
                               At investment_window_end:
                                                ↓
                            check-investment-windows edge function
                                                ↓
                            Smart Contract: finalizeCampaign()
                                    ↓                    ↓
                          Success (≥ min_raise)    Fail (< min_raise)
                                    ↓                    ↓
                          Release funds to owner    Auto-refund investors
                                    ↓                    ↓
                          Mint HTS tokens      Delete investments & reservations
                                    ↓                    ↓
                          Distribute tokens    Update tokenization status: failed
```

### 3.2 Edge Function → Smart Contract Interaction

**Example: Investment Deposit**
```typescript
// In create-investment edge function
import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";

// After payment confirmation
const depositTx = new ContractExecuteTransaction()
  .setContractId(ESCROW_MANAGER_CONTRACT_ID)
  .setGas(300000)
  .setFunction(
    "depositInvestment",
    new ContractFunctionParameters()
      .addUint256(campaignId)
      .addUint256(amountNgn)
  )
  .setPayableAmount(amountHbar); // Convert NGN to HBAR

const txResponse = await depositTx.execute(client);
const receipt = await txResponse.getReceipt(client);

// Store contract transaction ID in DB
await supabase
  .from('investments')
  .update({
    escrow_contract_tx_id: txResponse.transactionId.toString(),
    escrow_status: 'deposited'
  })
  .eq('id', investment_id);
```

### 3.3 Smart Contract → Edge Function Events

**Webhook Listener (New Edge Function)**
```typescript
// supabase/functions/smart-contract-webhook/index.ts
serve(async (req) => {
  const { eventType, data } = await req.json();
  
  switch (eventType) {
    case 'CampaignFinalized':
      // Update tokenization status
      await supabase
        .from('tokenizations')
        .update({
          status: data.successful ? 'funded' : 'failed',
          final_raise: data.totalRaised
        })
        .eq('id', data.propertyId);
      break;
      
    case 'RefundProcessed':
      // Update investment status
      await supabase
        .from('investments')
        .update({
          payment_status: 'refunded',
          refund_amount: data.amount,
          refund_processed_at: new Date().toISOString()
        })
        .eq('escrow_contract_tx_id', data.txId);
      break;
      
    case 'DividendClaimed':
      // Update dividend payment status
      await supabase
        .from('dividend_payments')
        .update({
          payment_status: 'completed',
          paid_at: new Date().toISOString()
        })
        .eq('recipient_id', data.recipient);
      break;
  }
});
```

---

## 4. Database Schema Updates

### 4.1 New Tables

**smart_contract_config**
```sql
CREATE TABLE smart_contract_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_name TEXT NOT NULL UNIQUE, -- 'escrow_manager', 'dividend_distributor', etc.
  contract_id TEXT NOT NULL, -- Hedera contract ID (0.0.x)
  contract_address TEXT NOT NULL, -- EVM address
  deployment_network TEXT NOT NULL, -- 'testnet', 'mainnet'
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  version TEXT NOT NULL,
  abi JSONB NOT NULL, -- Contract ABI for function calls
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**smart_contract_transactions**
```sql
CREATE TABLE smart_contract_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id TEXT NOT NULL,
  function_name TEXT NOT NULL,
  transaction_id TEXT NOT NULL, -- Hedera transaction ID
  transaction_hash TEXT, -- EVM transaction hash
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  gas_used BIGINT,
  parameters JSONB,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Updates to Existing Tables

**tokenizations table:**
```sql
ALTER TABLE tokenizations ADD COLUMN escrow_campaign_id BIGINT;
ALTER TABLE tokenizations ADD COLUMN escrow_contract_id TEXT;
ALTER TABLE tokenizations ADD COLUMN escrow_status TEXT DEFAULT 'pending'; -- pending, deposited, finalized, released, refunded
```

**investments table:**
```sql
ALTER TABLE investments ADD COLUMN escrow_contract_tx_id TEXT;
ALTER TABLE investments ADD COLUMN escrow_deposit_amount NUMERIC;
ALTER TABLE investments ADD COLUMN escrow_status TEXT DEFAULT 'pending'; -- pending, deposited, released, refunded
```

**dividend_distributions table:**
```sql
ALTER TABLE dividend_distributions ADD COLUMN distribution_contract_id BIGINT;
ALTER TABLE dividend_distributions ADD COLUMN contract_tx_id TEXT;
```

---

## 5. Implementation Phases

### Phase 1: Smart Contract Development & Testing (Week 1-2)
**Tasks:**
1. Write Solidity contracts:
   - Platform Escrow Manager
   - Dividend Distributor
   - Governance Contract
   - Multi-Sig Withdrawal
2. Unit tests for all contracts
3. Deploy to Hedera Testnet
4. Create contract interaction utilities

**Deliverables:**
- Deployed contracts on testnet
- Contract addresses & ABIs
- Test coverage reports

### Phase 2: Database & Infrastructure Updates (Week 3)
**Tasks:**
1. Run database migration for new tables
2. Update existing tables with contract-related columns
3. Create smart contract config entries
4. Set up contract monitoring

**Deliverables:**
- Updated database schema
- Contract configuration in DB
- Monitoring dashboard

### Phase 3: Edge Function Integration (Week 4-5)
**Tasks:**
1. Update `create-investment` to interact with escrow contract
2. Update `check-investment-windows` to call `finalizeCampaign()`
3. Create `smart-contract-webhook` edge function
4. Update `distribute-dividends` to use dividend contract
5. Add contract event listeners

**Deliverables:**
- Updated edge functions
- Webhook endpoint for contract events
- Integration tests

### Phase 4: Frontend Updates (Week 6)
**Tasks:**
1. Add escrow status indicators to investment flow
2. Display contract transaction IDs
3. Add "View on HashScan" links for transparency
4. Update investment progress to show escrow state

**Deliverables:**
- Updated UI components
- Transparency features
- User documentation

### Phase 5: Testing & Security Audit (Week 7-8)
**Tasks:**
1. End-to-end testing on testnet
2. Security audit of smart contracts
3. Penetration testing
4. Gas optimization
5. Load testing

**Deliverables:**
- Test reports
- Security audit report
- Optimized contracts
- Performance benchmarks

### Phase 6: Mainnet Deployment (Week 9)
**Tasks:**
1. Deploy contracts to Hedera Mainnet
2. Update edge functions with mainnet contract IDs
3. Migrate existing tokenizations to hybrid system
4. Monitor initial transactions

**Deliverables:**
- Live smart contracts on mainnet
- Migration complete
- Monitoring active

---

## 6. Cost Analysis

### Contract Deployment Costs (Hedera Mainnet)
- **Escrow Manager Contract:** ~50 HBAR (~$2.50)
- **Dividend Distributor Contract:** ~40 HBAR (~$2.00)
- **Governance Contract:** ~35 HBAR (~$1.75)
- **Multi-Sig Withdrawal Contract:** ~30 HBAR (~$1.50)
- **Total Deployment:** ~155 HBAR (~$7.75)

### Transaction Costs (Per Operation)
- **Escrow Deposit:** ~0.01 HBAR (~$0.0005)
- **Campaign Finalization:** ~0.05 HBAR (~$0.0025)
- **Dividend Distribution (batch 100):** ~0.10 HBAR (~$0.005)
- **Governance Vote:** ~0.01 HBAR (~$0.0005)

### Monthly Operational Estimate
Assuming 100 investments, 10 tokenizations, 5 distributions:
- **Total:** ~5 HBAR/month (~$0.25/month)

**Comparison:**
- Current system: $0 (edge functions only)
- Hybrid system: ~$0.25/month + initial $7.75 deployment
- **Benefit:** Trustless, transparent, automated financial operations

---

## 7. Security Considerations

### Smart Contract Security
1. **Access Control:**
   - Only platform owner can register campaigns
   - Only contract can release funds
   - Time-locks on critical functions

2. **Reentrancy Protection:**
   - Use OpenZeppelin's ReentrancyGuard
   - Checks-Effects-Interactions pattern

3. **Overflow Protection:**
   - Use Solidity 0.8+ (built-in overflow checks)
   - SafeMath for additional safety

4. **Pausability:**
   - Emergency pause mechanism
   - Upgrade path for critical bugs

### Edge Function Security
1. **Service Role Protection:**
   - Only service role can call contract admin functions
   - API key rotation policy

2. **Input Validation:**
   - Validate all data before contract calls
   - Sanitize user inputs

3. **Error Handling:**
   - Graceful degradation if contract unavailable
   - Retry mechanism for failed transactions

---

## 8. Monitoring & Alerts

### Contract Event Monitoring
- Listen for all contract events via Hedera Mirror Node
- Store events in `smart_contract_transactions` table
- Alert on failed transactions

### Performance Metrics
- Track gas usage per function
- Monitor transaction success rate
- Measure average confirmation time

### Financial Metrics
- Total value locked (TVL) in escrow
- Distribution success rate
- Refund processing time

---

## 9. Rollback Plan

If critical issues arise:

1. **Pause smart contracts** via emergency pause function
2. **Revert to edge function-only** mode for new investments
3. **Process existing escrows** manually via admin interface
4. **Migrate funds** from contracts to platform wallet
5. **Fix issues** and redeploy
6. **Resume hybrid mode** after testing

---

## 10. Success Metrics

### Technical Metrics
- ✅ 99.9% contract uptime
- ✅ <5 second transaction confirmation
- ✅ 100% refund success rate
- ✅ Zero security incidents

### Business Metrics
- ✅ Increased investor trust (measured via surveys)
- ✅ Reduced support tickets for refunds
- ✅ Faster dividend distribution
- ✅ Higher tokenization success rate

---

## 11. Next Steps

1. **Approve this plan** ✓
2. **Set up development environment** (Hedera SDK, Solidity compiler)
3. **Write first contract** (Escrow Manager)
4. **Deploy to testnet** and begin integration testing
5. **Iterate based on feedback**

---

## Appendix A: Contract Addresses (To Be Filled)

| Contract Name | Testnet Address | Mainnet Address |
|--------------|----------------|-----------------|
| Escrow Manager | TBD | TBD |
| Dividend Distributor | TBD | TBD |
| Governance | TBD | TBD |
| Multi-Sig Withdrawal | TBD | TBD |

---

## Appendix B: Edge Function Updates

### Functions Requiring Updates:
1. ✅ `create-investment` - Add escrow deposit
2. ✅ `check-investment-windows` - Add campaign finalization
3. ✅ `distribute-dividends` - Use dividend contract
4. ✅ `process-withdrawal` - Use multi-sig contract
5. 🆕 `smart-contract-webhook` - New event listener

### Functions Remaining Unchanged:
- `create-hedera-account`
- `create-hedera-token`
- `kyc-webhook`
- `paystack-webhook`
- `submit-to-hcs`
- All other property management functions

---

**Status:** Ready for implementation
**Estimated Timeline:** 9 weeks
**Budget:** ~$8 initial + ~$0.25/month operational
