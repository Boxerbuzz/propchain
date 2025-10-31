# Smart Contracts for Governance & Fund Management

This directory contains Solidity smart contracts for trustless governance,
dividend distribution, and multi-signature treasury management on Hedera.

## 📁 Directory Structure

```bash
contracts/
├── solidity/                    # Smart contract source files
│   ├── GovernanceExecutor.sol   # Proposal execution with escrow
│   ├── DividendDistributor.sol  # Automated dividend payouts
│   ├── MultiSigTreasury.sol     # Multi-sig property treasury
│   └── PlatformEscrowManager.sol # Investment escrow
├── deployment/                  # Deployment scripts
│   ├── deploy-testnet.ts        # Testnet deployment
│   ├── deploy-mainnet.ts        # Mainnet deployment (to be created)
│   └── contract-config.json     # Deployed contract addresses
└── test/                        # Contract tests (to be created)
```

## 🔑 Smart Contracts Overview

### 1. GovernanceExecutor

**Purpose:** Executes approved governance proposals with automatic fund locking
and release.

**Key Features:**

- Register proposals on-chain after off-chain voting setup
- Automatic fund locking when proposal passes
- Controlled fund release to contractors
- Cancellation with refund mechanism

**Gas Estimate:** ~150,000 gas per execution

### 2. DividendDistributor

**Purpose:** Manages dividend distribution to token holders.

**Key Features:**

- Create distributions with snapshot mechanism
- Both claim-based (gas-efficient) and batch distribution (better UX)
- Expiry mechanism for unclaimed dividends
- Claimable amount tracking per holder

**Gas Estimate:**

- Create distribution: ~100,000 gas
- Claim: ~50,000 gas per claim
- Batch (50 recipients): ~2,500,000 gas

### 3. MultiSigTreasury

**Purpose:** Secure multi-signature wallet for property treasury management.

**Key Features:**

- Configurable signer list and approval threshold
- Withdrawal request submission and approval flow
- Automatic execution when threshold met
- Signer management (add/remove)

**Gas Estimate:** ~200,000 gas per withdrawal

### 4. PlatformEscrowManager

**Purpose:** Holds investment funds until tokenization target is met.

**Key Features:**

- Escrow creation with target/minimum raise amounts
- Investment deposit tracking
- Automatic finalization or refund based on outcome
- Individual refund claims

**Gas Estimate:** ~80,000 gas per investment

## 🛠️ Development Setup

### Prerequisites

```bash
# Install Node.js dependencies (if using Hardhat)
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Or use Foundry (recommended for Hedera)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Compilation

```bash
# Using Hardhat
npx hardhat compile

# Using Foundry
forge build
```

### Testing

```bash
# Using Hardhat
npx hardhat test

# Using Foundry
forge test -vvv
```

## 🚀 Deployment

### Testnet Deployment

```bash
# Set environment variables
export HEDERA_TESTNET_RPC_URL="https://testnet.hashio.io/api"
export DEPLOYER_PRIVATE_KEY="your_private_key"

# Run deployment script
npx ts-node deployment/deploy-testnet.ts
```

### Mainnet Deployment

```bash
# Set environment variables
export HEDERA_MAINNET_RPC_URL="https://mainnet.hashio.io/api"
export DEPLOYER_PRIVATE_KEY="your_private_key"

# Run deployment script
npx ts-node deployment/deploy-mainnet.ts
```

## 🔗 Integration with Backend

After deployment, update Supabase secrets:

```sql
-- Insert contract addresses into smart_contract_config table
INSERT INTO smart_contract_config (
  contract_name,
  contract_address,
  deployment_network,
  contract_version,
  abi,
  deployed_at
) VALUES
  ('governance_executor', '0x...', 'testnet', '1.0.0', '{...}', NOW()),
  ('dividend_distributor', '0x...', 'testnet', '1.0.0', '{...}', NOW()),
  ('multisig_treasury', '0x...', 'testnet', '1.0.0', '{...}', NOW()),
  ('platform_escrow', '0x...', 'testnet', '1.0.0', '{...}', NOW());
```

## 🔐 Security Considerations

1. **Access Control:** All contracts use `onlyAuthorized` modifier for critical functions
2. **Reentrancy Protection:** Use checks-effects-interactions pattern
3. **Integer Overflow:** Using Solidity 0.8+ with built-in overflow checks
4. **Front-running:** Consider using commit-reveal for sensitive operations
5. **Upgrade Strategy:** Deploy new versions and migrate data
(contracts are not upgradeable)

### Recommended Security Audits

Before mainnet deployment:

- [ ] Internal code review
- [ ] Unit test coverage > 95%
- [ ] Integration testing
- [ ] Professional security audit ($5k-$15k)
- [ ] Bug bounty program

## 📊 Gas Optimization Tips

1. **Batch Operations:** Use `batchSetClaimableAmounts` instead of individual calls
2. **Storage Packing:** Structs are optimized for 256-bit words
3. **Event Logs:** Use indexed parameters sparingly (max 3 per event)
4. **View Functions:** All read operations are free (off-chain)

## 🧪 Testing Checklist

- [ ] Unit tests for all contract functions
- [ ] Edge case testing (zero amounts, invalid addresses)
- [ ] Access control testing
- [ ] Gas consumption profiling
- [ ] Integration tests with edge functions
- [ ] Testnet deployment verification
- [ ] End-to-end user flow testing

## 📖 Additional Resources

- [Hedera Smart Contract Service Docs](https://docs.hedera.com/hedera/smart-contracts)
- [Hedera JSON-RPC Relay](https://docs.hedera.com/hedera/core-concepts/smart-contracts/json-rpc-relay)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Foundry Book](https://book.getfoundry.sh/)

## 🤝 Contributing

When adding new contracts:

1. Follow existing naming conventions
2. Add comprehensive NatSpec comments
3. Write unit tests (>90% coverage)
4. Update this README
5. Submit for code review

## 📝 License

MIT License - See LICENSE file for details
