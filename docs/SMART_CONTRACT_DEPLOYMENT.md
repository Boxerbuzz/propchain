# Smart Contract Deployment Guide

This guide walks you through deploying the platform's smart contracts to Hedera Testnet.

## Prerequisites

- Node.js 18+ installed
- Hedera Testnet account with ≥50 HBAR
- ECDSA private key for deployer account
- Access to Supabase project with service role key

## Environment Variables

Create a `.env` file in the `contracts/` directory:

```env
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
DEPLOYER_PRIVATE_KEY=your_ecdsa_private_key_here
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_PRIVATE_KEY=your_private_key_here

# For Supabase integration
SUPABASE_URL=https://zjtqptljuggbymcoovey.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 1: Install Dependencies

```bash
cd contracts
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

## Step 2: Configure Hardhat

Create `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hedera_testnet: {
      url: process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 296
    }
  }
};

export default config;
```

## Step 3: Compile Contracts

```bash
npx hardhat compile
```

Expected output:

```bash
Compiled 4 Solidity files successfully
```

## Step 4: Deploy Contracts

Run the deployment script:

```bash
npx ts-node deployment/deploy-testnet.ts
```

The script will:

1. Deploy GovernanceExecutor
2. Deploy DividendDistributor
3. Deploy PlatformEscrowManager
4. Save deployment info to `testnet-deployment.json`

Expected output:

```bash
🚀 Starting deployment to Hedera Testnet...
📍 Deployer address: 0xYOUR_ADDRESS
💰 Deployer balance: 50.00 HBAR

📝 Deploying GovernanceExecutor...
   ✅ GovernanceExecutor deployed at: 0x1234567890abcdef...
   Transaction: 0.0.12345678@1234567890.123456789

📝 Deploying DividendDistributor...
   ✅ DividendDistributor deployed at: 0xabcdef1234567890...

📝 Deploying PlatformEscrowManager...
   ✅ PlatformEscrowManager deployed at: 0xfedcba0987654321...

💾 Deployment config saved to: testnet-deployment.json
```

## Step 5: Populate Supabase Database

After deployment, insert contract configurations into Supabase:

```sql
-- Insert GovernanceExecutor
INSERT INTO smart_contract_config (
  contract_name,
  contract_address,
  abi,
  contract_version,
  deployment_network,
  deployed_at,
  is_active
) VALUES (
  'governance_executor',
  '0x1234567890abcdef...', -- from deployment output
  '[...]'::jsonb, -- copy from artifacts/contracts/GovernanceExecutor.sol/GovernanceExecutor.json
  '1.0.0',
  'testnet',
  NOW(),
  true
);

-- Insert DividendDistributor
INSERT INTO smart_contract_config (
  contract_name,
  contract_address,
  abi,
  contract_version,
  deployment_network,
  deployed_at,
  is_active
) VALUES (
  'dividend_distributor',
  '0xabcdef1234567890...', -- from deployment output
  '[...]'::jsonb, -- copy from artifacts
  '1.0.0',
  'testnet',
  NOW(),
  true
);

-- Insert PlatformEscrowManager
INSERT INTO smart_contract_config (
  contract_name,
  contract_address,
  abi,
  contract_version,
  deployment_network,
  deployed_at,
  is_active
) VALUES (
  'platform_escrow',
  '0xfedcba0987654321...', -- from deployment output
  '[...]'::jsonb, -- copy from artifacts
  '1.0.0',
  'testnet',
  NOW(),
  true
);
```

## Step 6: Verify Contracts

Verify each contract on HashScan:

1. Visit <https://hashscan.io/testnet>
2. Search for contract address
3. Verify source code matches deployment

## Step 7: Update Edge Functions

Edge functions will automatically use the deployed contracts once the database is populated.

Test by creating a proposal:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/create-proposal \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "property_id": "...",
    "tokenization_id": "...",
    "title": "Test Proposal",
    "proposal_type": "maintenance",
    "budget_ngn": 50000
  }'
```

## Troubleshooting

### "Insufficient HBAR balance"

- Fund your account with at least 50 HBAR for deployment

### "Contract creation failed"

- Check gas limits in deployment script
- Verify Solidity compiler version matches

### "Transaction reverted"

- Check constructor parameters
- Verify all dependencies are deployed first

## Security Notes

- **Never commit private keys** to version control
- Use environment variables for all sensitive data
- Verify contract addresses match before populating database
- Test on testnet thoroughly before mainnet deployment

## Next Steps

After successful deployment:

1. Run integration tests (see `docs/TESTING_GUIDE.md`)
2. Monitor contract events via webhook
3. Proceed with mainnet deployment when ready
