import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mermaid } from "@/components/ui/mermaid";

const DatabaseSchema = () => {
  const tables = [
    {
      name: "users",
      description: "User profiles, authentication, and Hedera accounts",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "email", type: "TEXT", description: "User email (unique)" },
        { name: "full_name", type: "TEXT", description: "User's full name" },
        { name: "hedera_account_id", type: "TEXT", description: "Hedera account (0.0.xxxxx)" },
        { name: "hedera_private_key", type: "TEXT", description: "Encrypted private key" },
        { name: "kyc_status", type: "TEXT", description: "pending | verified | rejected" },
        { name: "wallet_balance_hbar", type: "NUMERIC", description: "HBAR balance" },
        { name: "wallet_balance_usdc", type: "NUMERIC", description: "USDC balance" },
      ],
      relationships: ["→ properties (owner)", "→ investments", "→ token_holdings", "→ governance_votes"],
    },
    {
      name: "properties",
      description: "Property listings and details",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "owner_id", type: "UUID", description: "FK to users" },
        { name: "title", type: "TEXT", description: "Property title" },
        { name: "location", type: "TEXT", description: "Property address" },
        { name: "price_ngn", type: "NUMERIC", description: "Property value in NGN" },
        { name: "property_status", type: "TEXT", description: "draft | pending | approved | rejected" },
        { name: "hcs_topic_id", type: "TEXT", description: "HCS topic for events" },
        { name: "listing_status", type: "TEXT", description: "active | inactive | sold" },
      ],
      relationships: ["→ tokenizations", "→ property_events", "→ property_documents"],
    },
    {
      name: "tokenizations",
      description: "Token configuration and treasury details",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "property_id", type: "UUID", description: "FK to properties" },
        { name: "tokenization_type", type: "TEXT", description: "equity | debt | revenue" },
        { name: "token_id", type: "TEXT", description: "Hedera token ID (0.0.xxxxx)" },
        { name: "token_symbol", type: "TEXT", description: "Token ticker symbol" },
        { name: "total_supply", type: "BIGINT", description: "Total tokens issued" },
        { name: "price_per_token_ngn", type: "NUMERIC", description: "Token price" },
        { name: "min_investment_ngn", type: "NUMERIC", description: "Minimum investment" },
        { name: "target_amount_ngn", type: "NUMERIC", description: "Fundraising goal" },
        { name: "investment_window_start", type: "TIMESTAMP", description: "Window opens" },
        { name: "investment_window_end", type: "TIMESTAMP", description: "Window closes" },
        { name: "multisig_treasury_address", type: "TEXT", description: "Unique MultiSig contract" },
        { name: "treasury_signers", type: "UUID[]", description: "[owner_id, admin_id]" },
        { name: "treasury_threshold", type: "INTEGER", description: "Required approvals (2)" },
      ],
      relationships: ["→ investments", "→ dividend_distributions", "→ governance_proposals"],
    },
    {
      name: "investments",
      description: "Investment records and payment tracking",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "user_id", type: "UUID", description: "FK to users" },
        { name: "tokenization_id", type: "UUID", description: "FK to tokenizations" },
        { name: "amount_invested_ngn", type: "NUMERIC", description: "Investment amount" },
        { name: "tokens_allocated", type: "NUMERIC", description: "Tokens reserved/received" },
        { name: "payment_method", type: "TEXT", description: "paystack | wallet" },
        { name: "payment_status", type: "TEXT", description: "pending | completed | failed" },
        { name: "investment_status", type: "TEXT", description: "pending | approved | rejected" },
        { name: "reservation_status", type: "TEXT", description: "active | expired | completed" },
        { name: "reservation_expires_at", type: "TIMESTAMP", description: "15-minute expiry" },
      ],
      relationships: ["→ investment_documents", "→ token_holdings"],
    },
    {
      name: "token_holdings",
      description: "Current token balances per user per property",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "user_id", type: "UUID", description: "FK to users" },
        { name: "tokenization_id", type: "UUID", description: "FK to tokenizations" },
        { name: "token_id", type: "TEXT", description: "Hedera token ID" },
        { name: "balance", type: "NUMERIC", description: "Current token balance" },
        { name: "total_invested_ngn", type: "NUMERIC", description: "Total investment" },
      ],
      relationships: ["→ dividend_payments", "→ governance_votes"],
    },
    {
      name: "dividend_distributions",
      description: "Dividend distribution campaigns",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "tokenization_id", type: "UUID", description: "FK to tokenizations" },
        { name: "total_amount_ngn", type: "NUMERIC", description: "Total distribution" },
        { name: "per_token_amount", type: "NUMERIC", description: "Amount per token" },
        { name: "distribution_date", type: "DATE", description: "When to distribute" },
        { name: "payment_status", type: "TEXT", description: "pending | completed" },
        { name: "contract_distribution_id", type: "TEXT", description: "On-chain distribution ID" },
      ],
      relationships: ["→ dividend_payments"],
    },
    {
      name: "dividend_payments",
      description: "Individual dividend payment records",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "distribution_id", type: "UUID", description: "FK to dividend_distributions" },
        { name: "user_id", type: "UUID", description: "FK to users" },
        { name: "amount_ngn", type: "NUMERIC", description: "Gross amount" },
        { name: "tax_withheld", type: "NUMERIC", description: "10% WHT" },
        { name: "net_amount", type: "NUMERIC", description: "Amount after tax" },
        { name: "payment_status", type: "TEXT", description: "pending | completed" },
        { name: "paid_at", type: "TIMESTAMP", description: "Payment timestamp" },
      ],
      relationships: [],
    },
    {
      name: "governance_proposals",
      description: "Governance proposals and voting",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "property_id", type: "UUID", description: "FK to properties" },
        { name: "tokenization_id", type: "UUID", description: "FK to tokenizations" },
        { name: "proposal_type", type: "TEXT", description: "maintenance | renovation | sale" },
        { name: "title", type: "TEXT", description: "Proposal title" },
        { name: "description", type: "TEXT", description: "Proposal details" },
        { name: "status", type: "TEXT", description: "draft | active | approved | rejected" },
        { name: "voting_start", type: "TIMESTAMP", description: "Voting starts" },
        { name: "voting_end", type: "TIMESTAMP", description: "Voting ends" },
        { name: "votes_for", type: "BIGINT", description: "Total votes for" },
        { name: "votes_against", type: "BIGINT", description: "Total votes against" },
        { name: "quorum_required", type: "NUMERIC", description: "50% turnout required" },
        { name: "approval_threshold", type: "NUMERIC", description: "60% approval required" },
        { name: "contract_proposal_id", type: "TEXT", description: "On-chain proposal ID" },
      ],
      relationships: ["→ governance_votes"],
    },
    {
      name: "property_events",
      description: "All property activities (rental, inspection, etc.)",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "property_id", type: "UUID", description: "FK to properties" },
        { name: "event_type", type: "TEXT", description: "rental | inspection | maintenance | purchase" },
        { name: "event_status", type: "TEXT", description: "pending | completed" },
        { name: "event_date", type: "DATE", description: "When event occurred" },
        { name: "hcs_transaction_id", type: "TEXT", description: "HCS consensus tx" },
        { name: "hcs_sequence_number", type: "BIGINT", description: "HCS message sequence" },
      ],
      relationships: ["→ property_rentals", "→ property_inspections", "→ property_maintenance"],
    },
    {
      name: "property_treasury_transactions",
      description: "MultiSig treasury withdrawal records",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "tokenization_id", type: "UUID", description: "FK to tokenizations" },
        { name: "transaction_type", type: "TEXT", description: "withdrawal | deposit" },
        { name: "amount_ngn", type: "NUMERIC", description: "Transaction amount" },
        { name: "status", type: "TEXT", description: "pending_approval | completed | cancelled" },
        { name: "metadata", type: "JSONB", description: "{approvers: [], contract_request_id: X}" },
        { name: "submitted_by", type: "UUID", description: "FK to users" },
      ],
      relationships: [],
    },
    {
      name: "smart_contract_config",
      description: "Deployed contract addresses and ABIs",
      columns: [
        { name: "id", type: "UUID", description: "Primary key" },
        { name: "contract_name", type: "TEXT", description: "governance_executor | dividend_distributor" },
        { name: "contract_address", type: "TEXT", description: "Hedera EVM address" },
        { name: "contract_id", type: "TEXT", description: "Hedera format (0.0.xxxxx)" },
        { name: "abi", type: "JSONB", description: "Contract ABI" },
        { name: "network", type: "TEXT", description: "testnet | mainnet" },
        { name: "is_active", type: "BOOLEAN", description: "Currently used?" },
      ],
      relationships: [],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Schema</CardTitle>
        <CardDescription>
          Complete overview of PropChain's PostgreSQL database structure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Entity Relationship Diagram */}
        <div className="bg-muted p-6 rounded-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4">Entity Relationship Diagram</h3>
          <Mermaid
            chart={`erDiagram
    users ||--o{ properties : owns
    users ||--o{ investments : makes
    users ||--o{ token_holdings : holds
    users ||--o{ governance_votes : casts
    properties ||--|| tokenizations : "has one"
    properties ||--o{ property_events : "has many"
    properties ||--o{ governance_proposals : "has many"
    tokenizations ||--o{ investments : receives
    tokenizations ||--o{ dividend_distributions : creates
    tokenizations ||--o{ property_treasury_transactions : manages
    investments ||--|| investment_documents : generates
    investments ||--|| token_holdings : creates
    dividend_distributions ||--o{ dividend_payments : "distributes to"
    governance_proposals ||--o{ governance_votes : "receives votes"`}
          />
        </div>

        <Separator />

        {/* Table Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Table Details</h3>
          {tables.map((table, index) => (
            <div key={table.name}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-mono">{table.name}</CardTitle>
                    <Badge variant="outline">{table.columns.length} columns</Badge>
                  </div>
                  <CardDescription className="text-xs">{table.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Columns */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Columns</h4>
                    <div className="space-y-1">
                      {table.columns.map((col) => (
                        <div key={col.name} className="flex items-start gap-2 text-xs p-2 bg-muted/50 rounded">
                          <Badge variant="secondary" className="text-xs font-mono">{col.type}</Badge>
                          <div className="flex-1">
                            <code className="font-semibold">{col.name}</code>
                            <p className="text-muted-foreground">{col.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relationships */}
                  {table.relationships.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Relationships</h4>
                      <div className="flex flex-wrap gap-2">
                        {table.relationships.map((rel) => (
                          <Badge key={rel} variant="outline" className="text-xs">
                            {rel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {index < tables.length - 1 && <div className="my-4" />}
            </div>
          ))}
        </div>

        <Separator />

        {/* Database Stats */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3">Database Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">{tables.length}</p>
              <p className="text-xs text-muted-foreground">Core Tables</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">50+</p>
              <p className="text-xs text-muted-foreground">Edge Functions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">4</p>
              <p className="text-xs text-muted-foreground">Smart Contracts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-xs text-muted-foreground">Hedera Services</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSchema;
