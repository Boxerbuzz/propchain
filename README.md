# Real Estate Tokenization Platform

A comprehensive platform for tokenizing real estate assets on the
Hedera network, enabling fractional ownership, automated dividend
 distributions, and decentralized governance.

<a id="table-of-contents"></a>

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [How The System Works](#how-the-system-works)
- [Key Features](#key-features)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Smart Contract Integration](#smart-contract-integration)
- [Testing](#testing)
- [Architecture Diagrams](#architecture-diagrams)
- [Pitch Deck & Certifications](#pitch-deck-certifications)

<a id="project-overview"></a>

## 🏢 Project Overview

This platform enables property owners to tokenize their real estate
assets and investors to purchase fractional ownership through
blockchain-based tokens. The system handles the complete lifecycle
from property registration to token distribution, dividend payments,
and governance voting.

### Core Capabilities

- **Property Tokenization**: Convert real estate assets into fungible tokens on Hedera
- **Fractional Investment**: Enable investors to purchase property fractions
starting from small amounts
- **Automated Dividends**: Distribute rental income and other returns to token holders
- **Decentralized Governance**: Token holders vote on property decisions
(maintenance, sales, etc.)
- **Multi-Signature Treasury**: Secure fund management with approval workflows
- **KYC Compliance**: Tiered verification system with investment limits
- **Payment Processing**: Support for NGN payments via Paystack
- **Activity Logging**: Complete audit trail recorded on Hedera Consensus
Service (HCS)

### Technology Stack

**Frontend:**

- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS + shadcn/ui for styling
- TanStack Query for state management
- React Router for navigation

**Backend:**

- Supabase (PostgreSQL database + Edge Functions)
- Hedera SDK for blockchain interactions
- Smart contracts (Solidity) deployed on Hedera

**Blockchain:**

- Hedera Hashgraph Network
- Hedera Token Service (HTS) for tokenization
- Hedera Consensus Service (HCS) for activity logging
- Hedera File Service (HFS) for document storage

<a id="system-architecture"></a>

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Application]
        WC[WalletConnect]
    end

    subgraph "Backend Layer"
        EF[Supabase Edge Functions]
        DB[(PostgreSQL Database)]
        RT[Realtime Subscriptions]
    end
    
    subgraph "Blockchain Layer"
        HTS[Hedera Token Service]
        HCS[Hedera Consensus Service]
        HFS[Hedera File Service]
        SC[Smart Contracts]
    end
    
    subgraph "External Services"
        PS[Paystack Payment Gateway]
        KYC[KYC Provider]
    end
    
    UI -->|API Calls| EF
    UI -->|Subscribe| RT
    UI -->|Sign Transactions| WC
    EF -->|Read/Write| DB
    EF -->|Token Operations| HTS
    EF -->|Activity Logs| HCS
    EF -->|Document Storage| HFS
    EF -->|Execute| SC
    EF -->|Process Payments| PS
    EF -->|Verify Identity| KYC
    DB -->|Notify| RT
    RT -->|Updates| UI
    SC -->|Events| EF
```

### Component Responsibilities

### Frontend (React)

- User interface and interaction
- Form validation and user input
- Real-time data display
- Wallet connection via WalletConnect
- Route-based access control

### Edge Functions (Supabase)

- Business logic execution
- Hedera blockchain interactions
- Smart contract calls
- Payment processing
- KYC verification workflows
- Activity logging to HCS

### Database (PostgreSQL)

- User accounts and profiles
- Property listings and tokenizations
- Investment records and holdings
- Transaction history
- Smart contract configuration
- Activity logs

### Smart Contracts (Solidity)

- Governance proposal execution
- Dividend distribution management
- Multi-signature treasury operations
- Platform escrow for investments

<a id="how-the-system-works"></a>

## 🔄 How The System Works

### For Investors

#### 1. **Account Creation & KYC**

```mermaid
sequenceDiagram
    actor Investor
    participant UI as Frontend
    participant Auth as Supabase Auth
    participant EF as Edge Function
    participant DB as Database
    participant KYC as KYC Provider
    
    Investor->>UI: Sign Up
    UI->>Auth: Create Account
    Auth->>DB: Store User Profile
    Investor->>UI: Submit KYC Documents
    UI->>EF: kyc-webhook
    EF->>KYC: Verify Identity
    KYC-->>EF: Verification Result
    EF->>DB: Update KYC Status
    DB-->>UI: Real-time Update
    UI->>Investor: KYC Approved
```

- User creates account with email/password
- Submits KYC documents (ID, address proof, selfie)
- System verifies identity through KYC provider
- Assigns investment tier based on verification level
  - **Tier 1**: Up to ₦5M investment limit
  - **Tier 2**: Up to ₦50M investment limit
  - **Tier 3**: Unlimited investment

#### 2. **Wallet Setup**

```mermaid
sequenceDiagram
    actor Investor
    participant UI as Frontend
    participant EF as Edge Function
    participant Hedera as Hedera Network
    participant DB as Database
    
    Investor->>UI: Setup Wallet
    UI->>EF: create-hedera-account
    EF->>Hedera: Create Account
    Hedera-->>EF: Account ID + Keys
    EF->>DB: Store Wallet Info
    EF->>Hedera: Associate USDC Token
    EF->>DB: Update Token Associations
    DB-->>UI: Wallet Ready
    UI->>Investor: Show Wallet Address
```

- Automatic Hedera account creation
- USDC token association for payments
- Secure key management
- Wallet balance tracking

#### 3. **Investment Flow**

```mermaid
sequenceDiagram
    actor Investor
    participant UI as Frontend
    participant EF as Edge Functions
    participant DB as Database
    participant PS as Paystack
    participant Hedera as Hedera Network
    
    Investor->>UI: Select Property & Amount
    UI->>EF: create-investment
    EF->>DB: Create Investment Record
    EF->>DB: Reserve Tokens
    UI->>Investor: Show Payment Options
    
    Investor->>UI: Choose Payment Method
    UI->>EF: initialize-paystack-payment
    EF->>PS: Create Payment Intent
    PS-->>UI: Payment URL
    UI->>Investor: Redirect to Payment
    
    Investor->>PS: Complete Payment
    PS->>EF: paystack-webhook
    EF->>DB: Confirm Payment
    EF->>EF: check-investment-windows
    EF->>Hedera: Mint Tokens
    Hedera-->>EF: Transaction Receipt
    EF->>DB: Update Token Holdings
    DB-->>UI: Investment Confirmed
```

**Steps:**

1. Browse properties and view tokenization details
2. Enter investment amount (respecting KYC limits)
3. Review terms and accept tokenization agreement
4. Choose payment method (Paystack for NGN)
5. Complete payment securely
6. System reserves tokens during investment window
7. Tokens automatically minted and distributed when window closes
8. Investment confirmation and document generation

#### 4. **Portfolio Management**

- View all property holdings
- Track token balances per property
- Monitor unrealized returns
- Access investment documents
- View transaction history

#### 5. **Dividend Claiming**

```mermaid
sequenceDiagram
    actor Investor
    participant UI as Frontend
    participant EF as Edge Function
    participant SC as Smart Contract
    participant DB as Database
    participant Hedera as Hedera Network
    
    Note over EF,SC: Admin creates distribution
    EF->>SC: createDistribution()
    SC->>SC: Record Snapshot
    
    Investor->>UI: View Available Dividends
    UI->>Investor: Show Claimable Amount
    Investor->>UI: Click Claim
    UI->>EF: claim-dividend
    EF->>SC: claimDividend(distributionId)
    SC->>SC: Calculate Amount
    SC->>Hedera: Transfer USDC
    SC-->>EF: Claim Successful
    EF->>DB: Record Payment
    DB-->>UI: Update Balance
    UI->>Investor: Dividend Received
```

- Property owners record rental income
- System creates dividend distribution
- Proportional allocation based on token holdings
- One-click claiming from smart contract
- Automatic USDC transfer to wallet

#### 6. **Governance Voting**

- View active proposals (maintenance, sales, major decisions)
- Cast votes weighted by token holdings
- Track proposal status and outcomes
- Participate in property management decisions

### For Property Owners

#### 1. **Property Registration**

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Frontend
    participant EF as Edge Function
    participant HFS as Hedera File Service
    participant HCS as Hedera Consensus
    participant DB as Database
    
    Owner->>UI: Fill Property Details
    Owner->>UI: Upload Images
    UI->>EF: upload-to-hfs
    EF->>HFS: Store Images
    HFS-->>EF: File IDs
    
    Owner->>UI: Upload Documents
    UI->>EF: upload-to-hfs
    EF->>HFS: Store Documents
    HFS-->>EF: File IDs
    
    UI->>EF: create-property
    EF->>HCS: Create Topic
    HCS-->>EF: Topic ID
    EF->>DB: Store Property Record
    DB-->>UI: Property Created
    UI->>Owner: Pending Approval
```

**Steps:**

1. Enter property details (location, size, type, value)
2. Upload property images
3. Upload legal documents (title deed, survey, permits)
4. System creates HCS topic for activity tracking
5. Submits for admin approval
6. Receives approval notification

#### 2. **Tokenization Setup**

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Frontend
    participant EF as Edge Function
    participant Hedera as Hedera Network
    participant SC as Smart Contract
    participant DB as Database
    
    Owner->>UI: Configure Tokenization
    UI->>EF: create-hedera-token
    EF->>Hedera: Create Fungible Token
    Hedera-->>EF: Token ID
    
    EF->>SC: Deploy Treasury Contract
    SC-->>EF: Contract Address
    
    EF->>DB: Store Tokenization Config
    EF->>EF: create-multisig-treasury
    EF->>SC: Initialize Multi-sig
    
    Owner->>UI: Set Investment Window
    UI->>EF: Update Tokenization
    EF->>DB: Save Window Dates
    DB-->>UI: Tokenization Active
```

**Configuration:**

- Token symbol and decimals
- Total token supply
- Token price (NGN/USD per token)
- Minimum investment amount
- Investment window (start/end dates)
- Fund allocation breakdown
- Use of funds documentation

**Multi-sig Treasury Setup:**

- Define signers (owner + co-signers)
- Set approval threshold (e.g., 2 of 3)
- Configure withdrawal limits

#### 3. **Investment Window Management**

- Monitor investment progress in real-time
- View reserved vs. allocated tokens
- Track total funds raised
- Close window manually or automatically
- Automated token minting at window closure

#### 4. **Event Recording**

Property owners record various events that affect token holders:

**Rental Income:**

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Frontend
    participant EF as Edge Function
    participant HCS as Hedera Consensus
    participant DB as Database
    
    Owner->>UI: Record Rental Payment
    UI->>EF: record-property-event
    EF->>HCS: Submit Event Message
    HCS-->>EF: Transaction ID
    EF->>DB: Store Rental Record
    EF->>DB: Create Treasury Transaction
    EF->>EF: Trigger Dividend Distribution
    DB-->>UI: Event Recorded
```

**Maintenance Events:**

- Create maintenance proposal
- Token holders vote on approval
- Execute maintenance with contractor details
- Record costs and upload receipts
- Update property condition status

**Inspection Reports:**

- Schedule property inspection
- Upload inspection photos and reports
- Record condition assessments
- Update property valuation

**Purchase/Sale Transactions:**

- Record partial or full property sales
- Update token holder ownership
- Distribute sale proceeds

#### 5. **Treasury Management**

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Frontend
    participant EF as Edge Function
    participant SC as Multi-sig Contract
    participant Signers as Other Signers
    participant DB as Database
    
    Owner->>UI: Submit Withdrawal Request
    UI->>EF: submit-treasury-withdrawal
    EF->>SC: submitWithdrawal()
    SC-->>EF: Withdrawal ID
    EF->>DB: Store Request
    
    Signers->>UI: Review Request
    Signers->>EF: approve-treasury-withdrawal
    EF->>SC: approveWithdrawal()
    SC->>SC: Check Threshold
    
    alt Threshold Met
        SC->>SC: Execute Withdrawal
        SC-->>EF: Transfer Complete
        EF->>DB: Update Status
    else More Approvals Needed
        SC-->>EF: Approval Recorded
        EF->>DB: Update Approvals
    end
```

**Features:**

- Submit withdrawal requests with justification
- Multi-signature approval workflow
- Spending limits and controls
- Complete transaction history
- Real-time balance tracking

### Smart Contract Integration

#### Governance Flow

The platform uses the **GovernanceExecutor** smart contract for on-chain
proposal management:

1. **Proposal Creation**: Token holders create proposals (maintenance, major decisions)
2. **On-chain Registration**: Proposal registered to smart contract with voting parameters
3. **Voting Period**: Token holders cast votes (for/against/abstain)
4. **Execution**: If approved, proposal funds are locked in contract
5. **Completion**: Upon completion, funds are released to executor

#### Dividend Distribution Flow

The **DividendDistributor** smart contract manages automated dividend payouts:

1. **Distribution Creation**: Property owner records income and creates distribution
2. **Snapshot**: Contract takes snapshot of token holdings at specific block
3. **Claiming**: Investors claim their proportional share from the contract
4. **Automatic Transfer**: USDC transferred directly to investor wallets
5. **Expiry**: Unclaimed dividends after expiry period return to treasury

#### Multi-sig Treasury Flow

The **MultiSigTreasury** contract provides secure fund management:

1. **Withdrawal Request**: Property owner submits withdrawal with details
2. **Approval Collection**: Co-signers review and approve on-chain
3. **Threshold Check**: Contract verifies required approvals met
4. **Execution**: Funds automatically transferred when threshold reached
5. **Audit Trail**: All actions recorded on blockchain

#### Platform Escrow Flow

The **PlatformEscrowManager** holds investment funds until tokenization goals
are met:

1. **Investment**: Funds deposited to escrow contract during investment window
2. **Target Check**: Contract monitors if funding target reached
3. **Success**: Funds released to property treasury if target met
4. **Failure**: Automatic refunds to investors if target not met
5. **Protection**: Investor funds protected until successful tokenization

<a id="key-features"></a>

## 🚀 Key Features

### KYC System

- **Tiered Verification**: Three levels with increasing investment limits
- **Document Upload**: ID cards, proof of address, selfie verification
- **Provider Integration**: Automated verification through KYC providers
- **Compliance Checks**: PEP, sanctions, adverse media screening
- **Status Tracking**: Real-time verification status updates

### Hedera Integration

- **Token Creation**: Automated HTS token creation for each property
- **Account Management**: Seamless Hedera account creation for users
- **Token Association**: Automatic token association workflows
- **HCS Activity Logging**: Immutable audit trail of all property events
- **HFS Document Storage**: Decentralized storage for property documents
- **Mirror Node Queries**: Transaction history and balance lookups

### Payment Processing

- **Paystack Integration**: Support for Nigerian bank transfers and cards
- **Multi-currency**: Handle NGN and USD conversions
- **Webhook Handling**: Automatic payment confirmation
- **Refund Processing**: Automated refunds for failed tokenizations
- **Payment History**: Complete transaction audit trail

### Real-time Updates

- **Supabase Realtime**: Live updates to investment status
- **Portfolio Sync**: Automatic balance and holding updates
- **Notification System**: In-app and email notifications
- **Activity Feed**: Real-time property event updates

### Chat & Collaboration

- **Property Chat Rooms**: Dedicated channels for each tokenized property
- **Investor Discussions**: Token holders communicate about property decisions
- **Event Announcements**: Automatic system messages for key events
- **Voting Discussions**: Deliberation on governance proposals

### Activity Logging

- **HCS Integration**: All events recorded to Hedera Consensus Service
- **Audit Trail**: Complete history of property events
- **Verifiable Records**: Cryptographically secured event logs
- **Compliance**: Regulatory compliance through comprehensive logging

<a id="database-schema"></a>

## 📊 Database Schema

### Core Tables

### Users & Authentication

- `auth.users` - Supabase auth users
- `kyc_verifications` - KYC status and documents
- `kyc_drafts` - Draft KYC submissions

### Properties

- `properties` - Property listings
- `property_images` - Property photos
- `property_documents` - Legal documents
- `tokenizations` - Token configuration per property

### Investments

- `investments` - Investment records
- `token_holdings` - Current token balances per user
- `investment_documents` - Generated investment certificates

### Events

- `property_events` - Parent event records
- `property_rentals` - Rental income events
- `property_maintenance` - Maintenance events
- `property_inspections` - Inspection reports
- `property_purchases` - Sale transactions

### Dividends

- `dividend_distributions` - Distribution periods
- `dividend_payments` - Individual payments to investors

### Governance

- `governance_proposals` - Proposals for voting
- `proposal_votes` - Individual votes cast

### Treasury

- `property_treasury_transactions` - All treasury movements
- `treasury_withdrawal_requests` - Multi-sig withdrawal requests
- `treasury_withdrawal_approvals` - Approval records

### Smart Contracts

- `smart_contract_config` - Deployed contract addresses and ABIs
- `smart_contract_transactions` - Contract interaction logs

### Communication

- `chat_rooms` - Property discussion channels
- `chat_participants` - Room membership
- `chat_messages` - Messages and announcements

### System

- `notifications` - User notifications
- `activity_logs` - General activity tracking
- `system_settings` - Platform configuration

### Key Relationships

```mermaid
erDiagram
    properties ||--o{ tokenizations : has
    properties ||--o{ property_events : records
    properties ||--o{ investments : receives
    tokenizations ||--o{ investments : accepts
    tokenizations ||--o{ token_holdings : creates
    tokenizations ||--o{ dividend_distributions : generates
    investments }o--|| users : made_by
    token_holdings }o--|| users : owned_by
    dividend_distributions ||--o{ dividend_payments : contains
    dividend_payments }o--|| users : paid_to
    properties ||--o{ governance_proposals : subject_of
    governance_proposals ||--o{ proposal_votes : receives
    proposal_votes }o--|| users : cast_by
    properties ||--o{ chat_rooms : has
    chat_rooms ||--o{ chat_participants : contains
    chat_participants }o--|| users : includes
    users ||--o| kyc_verifications : verified_by
```

<a id="getting-started"></a>

## 🛠️ Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Supabase account (for backend)
- Hedera testnet account (for blockchain)

### Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hedera Configuration (Edge Functions)
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_PRIVATE_KEY=302e...
HEDERA_NETWORK=testnet

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Smart Contract Addresses (Testnet)
GOVERNANCE_EXECUTOR_ADDRESS=0x637De4b8E8e39f97638485BdC90F937A5898daA7
DIVIDEND_DISTRIBUTOR_ADDRESS=0x418BC4d08A8ac4F2AeA9C71a9cf3BE7De0eB508A
MULTISIG_TREASURY_ADDRESS=0x2b461A252EEb91A11fE003e751aa98DA1D625F2C
PLATFORM_ESCROW_ADDRESS=0x72401B82c03fb61756A804785f3fA8C5AB65ea9B
```

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Database Setup

1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/`
3. Execute smart contract configuration SQL (see Smart Contract section)
4. Set up Row Level Security policies (already included in migrations)

### Smart Contract Deployment

See `docs/SMART_CONTRACT_DEPLOYMENT.md` for detailed deployment instructions.

Quick start:

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run deployment/deploy-testnet.ts --network testnet
```

Deployed contract addresses can be found in `docs/SMART_CONTRACT_ADDRESSES.md`

<a id="smart-contract-integration"></a>

## 📝 Smart Contract Integration

### Deployed Contracts (Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| GovernanceExecutor | `0x637De4b8E8e39f97638485BdC90F937A5898daA7` | On-chain proposal execution and fund management |
| DividendDistributor | `0x418BC4d08A8ac4F2AeA9C71a9cf3BE7De0eB508A` | Automated dividend distribution to token holders |
| MultiSigTreasury | `0x2b461A252EEb91A11fE003e751aa98DA1D625F2C` | Multi-signature treasury management |
| PlatformEscrowManager | `0x72401B82c03fb61756A804785f3fA8C5AB65ea9B` | Investment escrow until funding targets met |

### Integration Architecture

Edge functions interact with smart contracts through the `SmartContractService`:

```typescript
// Example: Creating a dividend distribution
const result = await smartContractService.createDistributionOnChain({
  propertyId: 'uuid',
  tokenizationId: 'uuid',
  totalAmount: '1000',
  perTokenAmount: '0.1',
  distributionPeriod: 'Q1 2024'
});
```

The service handles:

- Fetching contract configuration from database
- Initializing Hedera client
- Executing contract function calls
- Logging transactions to database
- Error handling and retries

### Event Monitoring

The system monitors smart contract events in two ways:

1. **Webhook**: Receives real-time events from Hedera (when configured)
2. **Polling**: `poll-contract-events` edge function queries Mirror Node
every 5 minutes

Supported events:

- `ProposalRegistered`
- `ProposalExecuted`
- `DistributionCreated`
- `DividendClaimed`
- `WithdrawalSubmitted`
- `WithdrawalApproved`
- `WithdrawalExecuted`

See `docs/SMART_CONTRACT_INTEGRATION.md` for detailed API documentation.

<a id="testing"></a>

## 🧪 Testing

### Frontend Testing

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Edge Function Testing

Test individual edge functions locally:

```bash
# Example: Test proposal creation
curl -X POST http://localhost:54321/functions/v1/create-proposal \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "uuid",
    "title": "Test Proposal",
    "description": "Testing governance flow"
  }'
```

### Database Queries

Test database queries directly in Supabase SQL editor or use the Supabase client:

```typescript
// Example: Query token holdings
const { data, error } = await supabase
  .from('token_holdings')
  .select('*')
  .eq('user_id', userId);
```

### Smart Contract Testing

```bash
cd contracts
npx hardhat test
```

### Manual Testing Scenarios

1. **Complete Investment Flow**
   - Create account → Complete KYC → Setup wallet → Invest in property → Verify
   tokens received

2. **Dividend Distribution**
   - Record rental income → Create distribution → Claim dividend → Verify USDC received

3. **Governance Proposal**
   - Create maintenance proposal → Vote on proposal → Execute if approved →
   Verify funds locked

4. **Multi-sig Withdrawal**
   - Submit withdrawal request → Collect approvals → Verify automatic execution

5. **Property Event Recording**
   - Record inspection → Upload documents → Verify HCS submission →
   Check activity feed

<a id="architecture-diagrams"></a>

## 📖 Architecture Diagrams

### Overall System Flow

```mermaid
graph LR
    A[Investor Signs Up] --> B[Complete KYC]
    B --> C[Setup Hedera Wallet]
    C --> D[Browse Properties]
    D --> E[Make Investment]
    E --> F[Payment via Paystack]
    F --> G[Tokens Minted]
    G --> H[Tokens Distributed]
    H --> I[Portfolio Management]
    I --> J[Claim Dividends]
    I --> K[Vote on Proposals]
    
    L[Owner Registers Property] --> M[Upload Documents]
    M --> N[Property Approved]
    N --> O[Configure Tokenization]
    O --> P[Open Investment Window]
    P --> E
    P --> Q[Record Events]
    Q --> R[Create Distributions]
    R --> J
    Q --> S[Create Proposals]
    S --> K
```

### Investment Window Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Property Created
    Draft --> Active: Investment Window Opens
    Active --> Closing: Window End Date Reached
    Closing --> Successful: Target Reached
    Closing --> Failed: Target Not Reached
    Successful --> Minting: Trigger Token Mint
    Minting --> Distributed: Allocate Tokens
    Failed --> Refunding: Process Refunds
    Refunding --> Closed
    Distributed --> [*]
    Closed --> [*]
```

### Smart Contract Interaction Flow

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant EF as Edge Function
    participant DB as Database
    participant SC as Smart Contract
    participant Hedera as Hedera Network
    
    UI->>EF: Call Edge Function
    EF->>DB: Fetch Contract Config
    DB-->>EF: Contract Address + ABI
    EF->>EF: Initialize Hedera Client
    EF->>SC: Execute Contract Function
    SC->>Hedera: Process Transaction
    Hedera-->>SC: Transaction Receipt
    SC-->>EF: Function Result
    EF->>DB: Log Transaction
    EF->>DB: Update Related Records
    DB-->>UI: Success Response
    
    Note over SC,Hedera: Emit Event
    Hedera->>EF: Webhook/Polling
    EF->>DB: Process Event
    DB-->>UI: Realtime Update
```

<a id="additional-documentation"></a>

## 📚 Additional Documentation

<a id="pitch-deck-certifications"></a>

## 📎 Pitch Deck & Certifications

- [Pitch Deck](https://propchain-ng.web.app/pitch) — overview of PropChain vision, traction, and roadmap
- [Hedera Certification](https://drive.google.com/file/d/1X-s1-udqsh5bbc7gDyNpcp_s416Jmw1w/view?usp=drive_link )
— official Hedera network certification credentials

<a id="security-considerations"></a>

## 🔐 Security Considerations

- Private keys stored as Supabase secrets, never in code
- Row Level Security (RLS) policies on all database tables
- KYC verification required before investments
- Multi-signature approvals for treasury withdrawals
- Investment limits enforced based on KYC tier
- Smart contract auditing recommended before mainnet
- Regular security scans and updates

## 🚀 Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains the production build
```

### Edge Functions Deployment

Edge functions are automatically deployed through Supabase CLI:

```bash
supabase functions deploy
```

### Database Migrations

Apply migrations to production:

```bash
supabase db push
```

## 🤝 Contributing

This is a private project. For authorized contributors:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 🆘 Support

For technical support or questions:

- Check Supabase logs for edge function errors
- Review Hedera Mirror Node for transaction history
- Contact the development team

---

**Project URL**: https://propchain-visuals.vercel.app OR https://propchain-ng.web.app/pitch

Built with ❤️ using React, Supabase, and Hedera Hashgraph
