<!-- 558e0044-a216-40db-ab44-29a708dc5109 25b68a06-1270-457f-8430-bc9f803e5c4a -->
# Smart Contract Integration Implementation Plan

## Overview

Transform the platform from a centralized HTS-based system to a hybrid architecture with on-chain smart contracts handling financial logic (escrow, dividends, governance, withdrawals) while keeping HTS for tokenization and edge functions for business logic.

## Phase 1: Smart Contract Development

### 1.1 Solidity Contracts to Create

- **contracts/PlatformEscrowManager.sol** - Core escrow contract managing all property investment campaigns
- Functions: registerTokenization, depositInvestment, finalizeCampaign, claimRefund, releaseFunds
- Events: CampaignRegistered, InvestmentDeposited, CampaignFinalized, RefundProcessed, FundsReleased

- **contracts/DividendDistributor.sol** - Automated dividend distribution to token holders
- Functions: createDistribution, claimDividend, batchProcessDividends
- Events: DistributionCreated, DividendClaimed, DividendProcessed

- **contracts/GovernanceContract.sol** - On-chain voting for property decisions
- Functions: createProposal, vote, executeProposal
- Events: ProposalCreated, VoteCast, ProposalExecuted

- **contracts/MultiSigWithdrawal.sol** - Secure multi-signature withdrawal mechanism
- Functions: initiateWithdrawal, approveWithdrawal, executeWithdrawal
- Events: WithdrawalInitiated, WithdrawalApproved, WithdrawalExecuted

### 1.2 Contract Testing Files

- **tests/PlatformEscrowManager.test.ts** - Unit tests for escrow logic
- **tests/DividendDistributor.test.ts** - Unit tests for dividend distribution
- **tests/GovernanceContract.test.ts** - Unit tests for governance voting
- **tests/MultiSigWithdrawal.test.ts** - Unit tests for withdrawal security

### 1.3 Contract Deployment Scripts

- **scripts/deploy-testnet.ts** - Deploy all contracts to Hedera testnet
- **scripts/deploy-mainnet.ts** - Deploy all contracts to Hedera mainnet
- **scripts/verify-contracts.ts** - Verify contract deployment and configuration

## Phase 2: Database Schema Updates

### 2.1 New Migration Files

- **supabase/migrations/[timestamp]_create_smart_contract_config.sql**
- Creates `smart_contract_config` table for storing contract addresses and ABIs

- **supabase/migrations/[timestamp]_create_smart_contract_transactions.sql**
- Creates `smart_contract_transactions` table for tracking all contract interactions

- **supabase/migrations/[timestamp]_update_tokenizations_for_contracts.sql**
- Adds columns: escrow_campaign_id, escrow_contract_id, escrow_status

- **supabase/migrations/[timestamp]_update_investments_for_contracts.sql**
- Adds columns: escrow_contract_tx_id, escrow_deposit_amount, escrow_status

- **supabase/migrations/[timestamp]_update_dividend_distributions_for_contracts.sql**
- Adds columns: distribution_contract_id, contract_tx_id

## Phase 3: Edge Function Updates & New Functions

### 3.1 New Edge Function

- **supabase/functions/smart-contract-webhook/index.ts**
- Listens for contract events (CampaignFinalized, RefundProcessed, DividendClaimed, etc.)
- Updates database based on contract state changes
- Implements event handlers for all contract events

### 3.2 Edge Functions to Update

- **supabase/functions/create-investment/index.ts**
- Add contract interaction: depositInvestment() call after payment confirmation
- Store escrow_contract_tx_id and escrow_status in database

- **supabase/functions/check-investment-windows/index.ts**
- Add contract interaction: finalizeCampaign() call at window end
- Handle success/failure paths from contract response

- **supabase/functions/distribute-dividends/index.ts**
- Replace manual distribution with createDistribution() contract call
- Implement batchProcessDividends() for automated payouts

- **supabase/functions/process-withdrawal/index.ts**
- Integrate with MultiSigWithdrawal contract
- Implement multi-sig approval workflow

### 3.3 Contract Utility Functions

- **lib/contracts/escrowManager.ts** - Helper functions for escrow contract interactions
- **lib/contracts/dividendDistributor.ts** - Helper functions for dividend contract
- **lib/contracts/governance.ts** - Helper functions for governance contract
- **lib/contracts/multiSigWithdrawal.ts** - Helper functions for withdrawal contract
- **lib/contracts/eventListener.ts** - Event monitoring and parsing utilities
- **lib/contracts/gasOptimizer.ts** - Gas optimization utilities

## Phase 4: Frontend Updates

### 4.1 New Components

- **src/components/EscrowStatusIndicator.tsx** - Display escrow status for investments
- **src/components/ContractTransactionLink.tsx** - HashScan link component for transparency
- **src/components/EscrowProgressBar.tsx** - Visual representation of escrow state
- **src/components/DividendContractStatus.tsx** - Display dividend distribution contract status
- **src/components/GovernanceProposalCard.tsx** - Display governance proposals with voting UI
- **src/components/WithdrawalApprovalStatus.tsx** - Multi-sig approval status display

### 4.2 Pages to Update

- **src/pages/InvestmentFlow.tsx** - Add escrow status and contract transaction display
- **src/pages/PortfolioDetail.tsx** - Show contract interactions and HashScan links
- **src/pages/wallet/Dashboard.tsx** - Add escrow state to investment progress

### 4.3 Hooks to Update

- **src/hooks/useInvestment.ts** - Add escrow contract interaction logic
- **src/hooks/useWithdrawals.ts** - Integrate multi-sig contract workflow
- **src/hooks/usePropertyEvents.ts** - Add contract event subscription

### 4.4 New Hooks

- **src/hooks/useContractTransaction.ts** - Hook for tracking contract transaction status
- **src/hooks/useEscrowStatus.ts** - Hook for monitoring escrow campaign status
- **src/hooks/useGovernanceProposals.ts** - Hook for fetching and voting on proposals

## Phase 5: Monitoring & Infrastructure

### 5.1 Monitoring Tools

- **monitoring/contractEventListener.ts** - Service to listen for contract events via Mirror Node
- **monitoring/performanceTracker.ts** - Track gas usage and transaction metrics
- **monitoring/alertSystem.ts** - Alert on failed transactions or anomalies

### 5.2 Dashboard Components

- **src/pages/admin/ContractMonitoring.tsx** - Admin dashboard for contract health
- **src/components/admin/ContractMetrics.tsx** - Display TVL, success rates, gas usage
- **src/components/admin/FinancialMetrics.tsx** - Display escrow totals, dividend stats

## Phase 6: Testing & Documentation

### 6.1 Test Files

- **tests/integration/escrow-flow.test.ts** - End-to-end escrow workflow test
- **tests/integration/dividend-distribution.test.ts** - End-to-end dividend test
- **tests/integration/governance-voting.test.ts** - End-to-end governance test
- **tests/security/contract-security.test.ts** - Security audit test suite
- **tests/performance/gas-optimization.test.ts** - Gas usage benchmarks

### 6.2 Documentation Files

- **docs/SMART_CONTRACT_ARCHITECTURE.md** - Technical architecture documentation
- **docs/CONTRACT_DEPLOYMENT.md** - Deployment and configuration guide
- **docs/CONTRACT_INTERACTION_GUIDE.md** - Developer guide for contract interactions
- **docs/USER_GUIDE_ESCROW.md** - User guide for escrow-based investments
- **docs/EMERGENCY_PROCEDURES.md** - Rollback and emergency response procedures

## Phase 7: Configuration & Environment

### 7.1 Configuration Files

- **.env.testnet** - Testnet contract addresses and configuration
- **.env.mainnet** - Mainnet contract addresses and configuration
- **config/contracts.json** - Contract ABIs and metadata
- **config/gas-limits.json** - Gas limit configurations per function

## Implementation Todos

After creating all files above, the system will transition from centralized edge functions to a hybrid architecture where:

- Investment funds are held in smart contract escrow (trustless)
- Dividends are distributed via automated contract (transparent)
- Governance decisions are recorded on-chain (immutable)
- Withdrawals require multi-sig approval (secure)
- HTS tokens remain for property tokenization (unchanged)
- Edge functions handle UI/UX and database operations (streamlined)

## Key Integration Points

1. Payment confirmation → Escrow deposit → Database update
2. Investment window end → finalizeCampaign() → Mint tokens or refund
3. Dividend creation → createDistribution() → Users claim via contract
4. Contract events → Webhook → Database sync

### To-dos

- [ ] Create Solidity smart contracts (Escrow Manager, Dividend Distributor, Governance, Multi-Sig Withdrawal) with full test suites
- [ ] Create database migrations for smart contract tables and update existing tables with contract-related columns
- [ ] Build contract interaction utilities, event listeners, and gas optimization helpers
- [ ] Create smart-contract-webhook edge function to listen for and process contract events
- [ ] Update create-investment, check-investment-windows, distribute-dividends, and process-withdrawal edge functions with contract interactions
- [ ] Create new UI components for escrow status, contract transactions, governance proposals, and withdrawal approvals
- [ ] Create and update hooks for contract interactions, escrow status monitoring, and governance proposals
- [ ] Update investment flow, portfolio detail, and wallet dashboard pages with contract integration UI
- [ ] Build contract event monitoring, performance tracking, and alerting systems with admin dashboards
- [ ] Create integration tests, security audit tests, and performance benchmarks for all contract workflows
- [ ] Write technical architecture, deployment guides, user guides, and emergency procedures documentation
- [ ] Deploy all contracts to Hedera testnet, configure edge functions, and conduct end-to-end testing
- [ ] Deploy contracts to Hedera mainnet, update production configuration, and activate monitoring