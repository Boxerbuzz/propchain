import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FlowDiagram from "@/components/docs/FlowDiagram";
import TechStack from "@/components/docs/TechStack";
import DatabaseSchema from "@/components/docs/DatabaseSchema";
import {
  FileText,
  Code,
  Database,
  Shield,
  ArrowLeft,
  Menu,
  User,
  Monitor,
} from "lucide-react";

const SystemDocumentation = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: FileText },
    {
      id: "property-registration",
      label: "Property Registration",
      icon: FileText,
    },
    { id: "tokenization", label: "Tokenization", icon: Code },
    { id: "investment", label: "Investment Flow", icon: Database },
    { id: "events", label: "Property Events", icon: FileText },
    { id: "dividends", label: "Dividends", icon: Database },
    { id: "governance", label: "Governance", icon: Shield },
    { id: "multisig", label: "MultiSig Treasury", icon: Shield },
    { id: "verification", label: "Document Verification", icon: FileText },
    { id: "database", label: "Database Schema", icon: Database },
    { id: "tech-stack", label: "Tech Stack", icon: Code },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-foreground truncate">
                System Documentation
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Complete guide to PropChain platform architecture
              </p>
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Contents</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)] mt-4">
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={
                          activeSection === item.id ? "default" : "ghost"
                        }
                        className="w-full justify-start text-left"
                        size="sm"
                        onClick={() => scrollToSection(item.id)}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Table of Contents - Sidebar (Desktop Only) */}
          <Card className="hidden lg:block lg:col-span-1 h-fit sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-1 p-4">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      size="sm"
                      onClick={() => scrollToSection(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
            {/* Overview Section */}
            <section id="overview">
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>
                    PropChain is a blockchain-powered real estate tokenization
                    platform built on Hedera Hashgraph
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="user" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-auto">
                      <TabsTrigger
                        value="user"
                        className="text-xs md:text-sm gap-2"
                      >
                        <User className="h-4 w-4" />
                        User Perspective
                      </TabsTrigger>
                      <TabsTrigger
                        value="technical"
                        className="text-xs md:text-sm gap-2"
                      >
                        <Monitor className="h-4 w-4" />
                        Technical Perspective
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="user" className="space-y-4 pt-4">
                      <p className="text-muted-foreground">
                        PropChain allows property owners to tokenize their real
                        estate assets and enables investors to purchase
                        fractional ownership through blockchain tokens. The
                        platform handles everything from property verification
                        to dividend distribution automatically.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2">
                            For Property Owners
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Register properties, tokenize assets, manage events,
                            and distribute dividends
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2">
                            For Investors
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Browse properties, invest with KYC, receive tokens,
                            earn dividends, and vote on proposals
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2">
                            For Platform
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Verify properties, approve tokenizations, manage
                            compliance, and ensure security
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="technical" className="space-y-4 pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Hedera Token Service (HTS)
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Token creation & management
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Hedera Consensus Service (HCS)
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Immutable audit logs
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Hedera File Service (HFS)
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Document storage
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Smart Contracts</Badge>
                          <span className="text-sm text-muted-foreground">
                            MultiSig treasury, governance, dividends
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Supabase Edge Functions
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Backend automation
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Paystack Integration</Badge>
                          <span className="text-sm text-muted-foreground">
                            Fiat payments (NGN)
                          </span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </section>

            <Separator />

            {/* Property Registration Flow */}
            <section id="property-registration">
              <FlowDiagram
                title="1. Property Registration & Verification"
                description="How property owners submit their properties for tokenization"
                mermaidCode={`graph TD
    A[Owner: Fill Property Form] --> B[Upload Documents]
    B --> C[Upload Property Images]
    C --> D[Submit for Review]
    D --> E{HCS Topic Creation}
    E --> F[Upload Documents to HFS]
    F --> G[Calculate SHA-256 Hash]
    G --> H[Submit Metadata to HCS]
    H --> I[Store in Database]
    I --> J{Admin Review}
    J -->|Approved| K[Property Status: Approved]
    J -->|Rejected| L[Property Status: Rejected]
    K --> M[Property Listed - Ready for Tokenization]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style M fill:#10b981,stroke:#059669,color:#fff
    style L fill:#ef4444,stroke:#dc2626,color:#fff`}
                userPerspective={
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Step 1:</strong> Owner visits{" "}
                      <code>/properties/register</code>
                    </p>
                    <p>
                      <strong>Step 2:</strong> Fills out property details
                      (title, location, price, description)
                    </p>
                    <p>
                      <strong>Step 3:</strong> Uploads legal documents (title
                      deed, permits)
                    </p>
                    <p>
                      <strong>Step 4:</strong> Uploads property images
                    </p>
                    <p>
                      <strong>Step 5:</strong> Submits for admin approval
                    </p>
                    <p>
                      <strong>Step 6:</strong> Admin reviews and
                      approves/rejects
                    </p>
                    <p>
                      <strong>Step 7:</strong> Property appears in browse
                      listings if approved
                    </p>
                  </div>
                }
                technicalPerspective={
                  <div className="space-y-2 text-sm font-mono">
                    <p>
                      <strong>Component:</strong>{" "}
                      <code>RegisterProperty.tsx</code>
                    </p>
                    <p>
                      <strong>Database:</strong> INSERT into{" "}
                      <code>properties</code> table
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>create-hcs-topic</code>
                    </p>
                    <p className="ml-4">
                      → Creates unique HCS topic for property events
                    </p>
                    <p>
                      <strong>Edge Function:</strong> <code>upload-to-hfs</code>
                    </p>
                    <p className="ml-4">
                      → Uploads documents to Hedera File Service
                    </p>
                    <p>
                      <strong>Edge Function:</strong> <code>submit-to-hcs</code>
                    </p>
                    <p className="ml-4">
                      → Submits document hashes to HCS topic
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>property-approved</code>
                    </p>
                    <p className="ml-4">
                      → Updates status, creates activity log
                    </p>
                    <p>
                      <strong>Status Flow:</strong> draft → pending →
                      approved/rejected
                    </p>
                  </div>
                }
              />
            </section>

            {/* Tokenization Flow */}
            <section id="tokenization">
              <FlowDiagram
                title="2. Tokenization Setup"
                description="How properties are converted into blockchain tokens"
                mermaidCode={`graph TD
    A[Owner: Click Tokenize Property] --> B{Choose Tokenization Type}
    B -->|Equity| C[Equity: Ownership Shares]
    B -->|Debt| D[Debt: Fixed Returns]
    B -->|Revenue| E[Revenue: Profit Sharing]
    C --> F[Configure Token Parameters]
    D --> F
    E --> F
    F --> G[Define Use of Funds]
    G --> H[Accept Legal Terms]
    H --> I[Submit for Approval]
    I --> J{Admin Review}
    J -->|Approved| K[Create Hedera Token HTS]
    J -->|Rejected| Z[Tokenization Rejected]
    K --> L[Deploy MultiSig Treasury Contract]
    L --> M[Create Property Treasury Wallet]
    M --> N[Associate USDC Token]
    N --> O[Investment Window Opens]
    O --> P[Notify Investors]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style K fill:#3b82f6,stroke:#2563eb,color:#fff
    style L fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style O fill:#10b981,stroke:#059669,color:#fff`}
                userPerspective={
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Step 1:</strong> Owner clicks "Tokenize" on
                      approved property
                    </p>
                    <p>
                      <strong>Step 2:</strong> Selects tokenization type
                      (Equity/Debt/Revenue)
                    </p>
                    <p>
                      <strong>Step 3:</strong> Sets token parameters (supply,
                      price, decimals)
                    </p>
                    <p>
                      <strong>Step 4:</strong> Defines use of funds
                      (construction, renovation, etc.)
                    </p>
                    <p>
                      <strong>Step 5:</strong> Reviews and accepts legal terms
                    </p>
                    <p>
                      <strong>Step 6:</strong> Submits for admin approval
                    </p>
                    <p>
                      <strong>Step 7:</strong> After approval, tokens are
                      created on Hedera
                    </p>
                    <p>
                      <strong>Step 8:</strong> Investment window opens for
                      investors
                    </p>
                  </div>
                }
                technicalPerspective={
                  <div className="space-y-2 text-sm font-mono">
                    <p>
                      <strong>Component:</strong> <code>Tokenize.tsx</code>
                    </p>
                    <p>
                      <strong>Database:</strong> INSERT into{" "}
                      <code>tokenizations</code> table
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>tokenization-approved</code>
                    </p>
                    <p className="ml-4">→ Triggers token creation pipeline</p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>create-hedera-token</code>
                    </p>
                    <p className="ml-4">
                      → Hedera SDK: <code>TokenCreateTransaction</code>
                    </p>
                    <p className="ml-4">
                      → Returns: <code>token_id</code> (e.g., 0.0.12345)
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>create-multisig-treasury</code>
                    </p>
                    <p className="ml-4">
                      → Uses: <code>multiSigDeployer.ts</code>
                    </p>
                    <p className="ml-4">
                      → Deploys: <code>MultiSigTreasury.sol</code>
                    </p>
                    <p className="ml-4">
                      → Signers: [owner_id, admin_id], Threshold: 2
                    </p>
                    <p className="ml-4">
                      → Returns: <code>multisig_treasury_address</code>
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>create-property-treasury</code>
                    </p>
                    <p className="ml-4">
                      → Creates wallet, associates USDC token
                    </p>
                    <p>
                      <strong>Status:</strong> pending → active (investment
                      window open)
                    </p>
                  </div>
                }
              />
            </section>

            {/* Investment Flow */}
            <section id="investment">
              <FlowDiagram
                title="3. Investment Flow"
                description="Complete journey from browsing to token ownership"
                mermaidCode={`graph TD
    A[Investor: Browse Properties] --> B[View Property Details]
    B --> C[Click Invest]
    C --> D{KYC Verified?}
    D -->|No| E[Complete KYC Process]
    E --> F[Return to Investment]
    D -->|Yes| F
    F --> G[Enter Investment Amount]
    G --> H{Choose Payment Method}
    H -->|Paystack| I[Pay with NGN]
    H -->|Wallet| J[Pay with HBAR/USDC]
    I --> K[Paystack Redirect]
    K --> L[Payment Confirmed]
    J --> L
    L --> M[Tokens Reserved]
    M --> N{Investment Window Closed?}
    N -->|Yes| O[Mint Tokens to Treasury]
    N -->|No| P[Wait for Window Close]
    P --> O
    O --> Q[Distribute Tokens to KYC Users]
    Q --> R[Generate Investment Documents]
    R --> S[Submit to HCS]
    S --> T[Tokens in Investor Wallet]
    T --> U[Email Confirmation + Certificate]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style L fill:#3b82f6,stroke:#2563eb,color:#fff
    style T fill:#10b981,stroke:#059669,color:#fff`}
                userPerspective={
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Step 1:</strong> Browse properties at{" "}
                      <code>/browse</code>
                    </p>
                    <p>
                      <strong>Step 2:</strong> Click on property to view details
                    </p>
                    <p>
                      <strong>Step 3:</strong> Click "Invest Now" button
                    </p>
                    <p>
                      <strong>Step 4:</strong> System checks KYC status
                      (redirects if not verified)
                    </p>
                    <p>
                      <strong>Step 5:</strong> Enter investment amount
                    </p>
                    <p>
                      <strong>Step 6:</strong> Choose payment method (Paystack
                      NGN or Wallet HBAR/USDC)
                    </p>
                    <p>
                      <strong>Step 7:</strong> Complete payment
                    </p>
                    <p>
                      <strong>Step 8:</strong> Tokens are reserved (15-minute
                      expiry)
                    </p>
                    <p>
                      <strong>Step 9:</strong> When investment window closes,
                      tokens are minted
                    </p>
                    <p>
                      <strong>Step 10:</strong> Tokens distributed to investor's
                      Hedera wallet
                    </p>
                    <p>
                      <strong>Step 11:</strong> Investment certificate PDF
                      generated with QR code
                    </p>
                  </div>
                }
                technicalPerspective={
                  <div className="space-y-2 text-sm font-mono">
                    <p>
                      <strong>Component:</strong>{" "}
                      <code>InvestmentFlow.tsx</code>
                    </p>
                    <p>
                      <strong>KYC Check:</strong> <code>kycService.ts</code>
                    </p>
                    <p className="ml-4">
                      → Query: <code>kyc_verifications</code> table
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>create-investment</code>
                    </p>
                    <p className="ml-4">
                      → INSERT into <code>investments</code> table
                    </p>
                    <p className="ml-4">
                      → Status: pending, reservation_status: active
                    </p>
                    <p className="ml-4">→ Expiry: now() + 15 minutes</p>
                    <p>
                      <strong>Payment - Paystack:</strong>
                    </p>
                    <p className="ml-4">
                      → <code>initialize-paystack-payment</code>
                    </p>
                    <p className="ml-4">
                      → Webhook: <code>paystack-webhook</code>
                    </p>
                    <p className="ml-4">
                      → <code>verify-paystack-payment</code>
                    </p>
                    <p>
                      <strong>Payment - Wallet:</strong>
                    </p>
                    <p className="ml-4">
                      → <code>deduct-wallet-balance</code>
                    </p>
                    <p className="ml-4">→ Direct Hedera transfer</p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>process-investment-completion</code>
                    </p>
                    <p className="ml-4">→ Check if window closed</p>
                    <p className="ml-4">
                      → <code>mint-tokens-for-closed-window</code>
                    </p>
                    <p className="ml-4">
                      → Hedera: <code>TokenMintTransaction</code>
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>distribute-tokens-to-kyc-users</code>
                    </p>
                    <p className="ml-4">→ Only KYC-verified investors</p>
                    <p className="ml-4">
                      → Hedera: <code>TransferTransaction</code>
                    </p>
                    <p className="ml-4">
                      → UPDATE: <code>token_holdings</code> table
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>generate-investment-documents</code>
                    </p>
                    <p className="ml-4">→ @react-pdf/renderer: Create PDF</p>
                    <p className="ml-4">→ Upload to Supabase Storage</p>
                    <p className="ml-4">
                      → Generate QR code with verification URL
                    </p>
                    <p className="ml-4">→ Calculate SHA-256 hash</p>
                    <p className="ml-4">→ Submit metadata to HCS</p>
                  </div>
                }
              />
            </section>

            {/* Property Events */}
            <section id="events">
              <FlowDiagram
                title="4. Property Events"
                description="Recording rental, inspection, maintenance, and purchase events on blockchain"
                mermaidCode={`graph TD
    A[Owner: Go to Event Simulator] --> B{Select Event Type}
    B -->|Rental| C[Rental Event Form]
    B -->|Inspection| D[Inspection Event Form]
    B -->|Maintenance| E[Maintenance Event Form]
    B -->|Purchase| F[Purchase Event Form]
    C --> G[Fill Event Details]
    D --> G
    E --> G
    F --> G
    G --> H[Upload Event Photos]
    H --> I[Submit Event]
    I --> J[Create Event Record in DB]
    J --> K[Submit to HCS Topic]
    K --> L[Notify Investors in Chat]
    L --> M[Update Activity Logs]
    M --> N{Is Rental Event?}
    N -->|Yes| O[Auto-Create Dividend Distribution]
    N -->|No| P[Event Recorded]
    O --> Q[Process Rental Dividend]
    Q --> P
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style K fill:#3b82f6,stroke:#2563eb,color:#fff
    style O fill:#f59e0b,stroke:#d97706,color:#fff`}
                userPerspective={
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Step 1:</strong> Owner goes to{" "}
                      <code>/property/events</code>
                    </p>
                    <p>
                      <strong>Step 2:</strong> Selects event type (Rental,
                      Inspection, Maintenance, Purchase)
                    </p>
                    <p>
                      <strong>Step 3:</strong> Fills out event-specific form
                    </p>
                    <p>
                      <strong>Step 4:</strong> Uploads supporting
                      photos/documents
                    </p>
                    <p>
                      <strong>Step 5:</strong> Submits event
                    </p>
                    <p>
                      <strong>Step 6:</strong> Event is recorded on blockchain
                      (HCS)
                    </p>
                    <p>
                      <strong>Step 7:</strong> All investors receive
                      notification in property chat room
                    </p>
                    <p>
                      <strong>Step 8:</strong> If rental event with payment,
                      dividend distribution is auto-created
                    </p>
                  </div>
                }
                technicalPerspective={
                  <div className="space-y-2 text-sm font-mono">
                    <p>
                      <strong>Component:</strong>{" "}
                      <code>EventSimulator.tsx</code>
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>record-property-event</code>
                    </p>
                    <p className="ml-4">
                      → INSERT into <code>property_events</code> table
                    </p>
                    <p className="ml-4">
                      → event_type: rental | inspection | maintenance | purchase
                    </p>
                    <p>
                      <strong>Type-Specific Tables:</strong>
                    </p>
                    <p className="ml-4">
                      → Rental: <code>property_rentals</code>
                    </p>
                    <p className="ml-4">
                      → Inspection: <code>property_inspections</code>
                    </p>
                    <p className="ml-4">
                      → Maintenance: <code>property_maintenance</code>
                    </p>
                    <p className="ml-4">
                      → Purchase: <code>property_purchases</code>
                    </p>
                    <p>
                      <strong>Edge Function:</strong> <code>submit-to-hcs</code>
                    </p>
                    <p className="ml-4">
                      → Hedera: <code>TopicMessageSubmitTransaction</code>
                    </p>
                    <p className="ml-4">
                      → Returns: hcs_transaction_id, sequence_number
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>send-chat-system-message</code>
                    </p>
                    <p className="ml-4">
                      → Query: <code>chat_rooms</code> for property
                    </p>
                    <p className="ml-4">
                      → INSERT: <code>chat_messages</code> with type: system
                    </p>
                    <p>
                      <strong>Rental Auto-Dividend:</strong>
                    </p>
                    <p className="ml-4">
                      → Cron: <code>auto-process-rental-dividends</code>
                    </p>
                    <p className="ml-4">
                      → Calculate: 5% platform fee, 95% distributable
                    </p>
                    <p className="ml-4">
                      → CREATE: <code>dividend_distributions</code> record
                    </p>
                    <p className="ml-4">
                      → AUTO: <code>distribute-dividends</code>
                    </p>
                  </div>
                }
              />
            </section>

            {/* Dividends */}
            <section id="dividends">
              <FlowDiagram
                title="5. Dividend Distribution"
                description="Automated scheduled distribution of rental income to token holders"
                mermaidCode={`graph TD
    A[Tokens Minted: minted_at timestamp] --> B[Create Dividend Schedule]
    B --> C[Set frequency: monthly/quarterly/annually]
    C --> D[Calculate next_distribution_date from minted_at]
    D --> E[Rental Income Accumulates]
    E --> F{Schedule Due?}
    F -->|No| E
    F -->|Yes| G[process-scheduled-dividends runs]
    G --> H[Query confirmed rentals since last distribution]
    H --> I[Aggregate total rental income]
    I --> J[Calculate fees: platform_fee + management_fee]
    J --> K[Calculate distributable = gross - fees]
    K --> L[Query token holders balance > 0]
    L --> M[Calculate per_token_amount]
    M --> N[Create single distribution record]
    N --> O[Create dividend_payments for each holder]
    O --> P{Smart Contract Enabled?}
    P -->|Yes| Q[Register on DividendDistributor.sol]
    P -->|No| R[Transfer funds to holders]
    Q --> R
    R --> S[Update rentals: distribution_status = 'completed']
    S --> T[Update schedule: next_distribution_date]
    T --> U[Send notifications to holders]
    U --> V[Funds deposited to wallets]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style G fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style V fill:#10b981,stroke:#059669,color:#fff`}
                userPerspective={
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Step 1:</strong> Dividend schedule created when
                      tokens are minted
                    </p>
                    <p>
                      <strong>Step 2:</strong> Frequency set during tokenization
                      (monthly/quarterly/annually)
                    </p>
                    <p>
                      <strong>Step 3:</strong> Rental income accumulates between
                      distribution dates
                    </p>
                    <p>
                      <strong>Step 4:</strong> On schedule date, system
                      automatically aggregates all confirmed rentals
                    </p>
                    <p>
                      <strong>Step 5:</strong> Platform fee (1%) and management
                      fee (2.5%) are deducted
                    </p>
                    <p>
                      <strong>Step 6:</strong> Remaining amount distributed
                      proportionally to token holders
                    </p>
                    <p>
                      <strong>Step 7:</strong> Investors receive notification of
                      dividend payment
                    </p>
                    <p>
                      <strong>Step 8:</strong> Funds automatically deposited to
                      investor wallets
                    </p>
                    <p>
                      <strong>Note:</strong> No manual distribution - fully
                      automated on schedule
                    </p>
                  </div>
                }
                technicalPerspective={
                  <div className="space-y-2 text-sm font-mono">
                    <p>
                      <strong>Schedule Creation:</strong>{" "}
                      <code>mint-tokens-for-closed-window</code>
                    </p>
                    <p className="ml-4">
                      → After: <code>minted_at</code> timestamp set
                    </p>
                    <p className="ml-4">
                      → INSERT: <code>dividend_schedules</code>
                    </p>
                    <p className="ml-4">
                      → frequency: from{" "}
                      <code>tokenization.dividend_frequency</code>
                    </p>
                    <p className="ml-4">
                      → next_distribution_date: calculated from{" "}
                      <code>minted_at</code>
                    </p>
                    <p>
                      <strong>Scheduled Job:</strong>{" "}
                      <code>process-scheduled-dividends</code>
                    </p>
                    <p className="ml-4">→ Runs daily via cron</p>
                    <p className="ml-4">
                      → Query: schedules WHERE next_distribution_date {"<"}=
                      today
                    </p>
                    <p>
                      <strong>Rental Aggregation:</strong>
                    </p>
                    <p className="ml-4">
                      → Query: <code>property_rentals</code>
                    </p>
                    <p className="ml-4">
                      → WHERE: payment_status = 'confirmed'
                    </p>
                    <p className="ml-4">
                      → AND: distribution_status IN (null, 'pending')
                    </p>
                    <p className="ml-4">
                      → AND: start_date BETWEEN last_distribution_date AND
                      next_distribution_date
                    </p>
                    <p className="ml-4">→ SUM: total rental income</p>
                    <p>
                      <strong>Fee Calculation:</strong>
                    </p>
                    <p className="ml-4">
                      → platform_fee_amount = gross × (platform_fee_percentage /
                      100)
                    </p>
                    <p className="ml-4">
                      → management_fee_amount = gross ×
                      (management_fee_percentage / 100)
                    </p>
                    <p className="ml-4">
                      → distributable = gross - platform_fee - management_fee
                    </p>
                    <p>
                      <strong>Distribution Record:</strong>
                    </p>
                    <p className="ml-4">
                      → INSERT: <code>dividend_distributions</code>
                    </p>
                    <p className="ml-4">
                      → included_rental_ids: JSON array of aggregated rentals
                    </p>
                    <p className="ml-4">
                      → gross_amount_ngn, platform_fee_amount,
                      management_fee_amount
                    </p>
                    <p className="ml-4">
                      → per_token_amount: distributable / total_tokens
                    </p>
                    <p>
                      <strong>Payment Processing:</strong>
                    </p>
                    <p className="ml-4">
                      → INSERT: <code>dividend_payments</code> for each holder
                    </p>
                    <p className="ml-4">
                      → Call: <code>distribute-dividends</code> edge function
                    </p>
                    <p className="ml-4">
                      → UPDATE: <code>property_rentals</code>{" "}
                      distribution_status
                    </p>
                    <p className="ml-4">
                      → UPDATE: <code>dividend_schedules</code> dates
                    </p>
                    <p>
                      <strong>Smart Contract (Optional):</strong>
                    </p>
                    <p className="ml-4">
                      → <code>DividendDistributor.sol</code>
                    </p>
                    <p className="ml-4">
                      → Returns: contract_distribution_id, tx_hash
                    </p>
                  </div>
                }
              />
            </section>

            {/* Governance */}
            <section id="governance">
              <FlowDiagram
                title="6. Governance & Voting"
                description="Token-weighted voting for property decisions"
                mermaidCode={`graph TD
    A[Token Holder: Create Proposal] --> B[Select Proposal Type]
    B --> C[Fill Proposal Details]
    C --> D[Specify Required Funds]
    D --> E[Set Voting Period]
    E --> F[Submit Proposal]
    F --> G[Register on GovernanceExecutor.sol]
    G --> H[Notify All Token Holders]
    H --> I{Voting Process}
    I --> J[Token Holders Vote]
    J --> K[Voting Weight = Token Balance]
    K --> L{Voting Period Ended?}
    L -->|No| J
    L -->|Yes| M{Check Results}
    M --> N{Quorum Met? 50%+}
    N -->|No| O[Proposal Rejected]
    N -->|Yes| P{Approval Met? 60%+}
    P -->|No| O
    P -->|Yes| Q[Proposal Approved]
    Q --> R[Lock Funds in Contract]
    R --> S[Execute Action]
    S --> T[Release Funds to Recipient]
    T --> U[Update Execution Status]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style G fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Q fill:#10b981,stroke:#059669,color:#fff
    style O fill:#ef4444,stroke:#dc2626,color:#fff`}
                userPerspective={
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Step 1:</strong> Token holder creates proposal
                    </p>
                    <p>
                      <strong>Step 2:</strong> Selects type (maintenance,
                      renovation, sale, etc.)
                    </p>
                    <p>
                      <strong>Step 3:</strong> Sets voting period (e.g., 7 days)
                    </p>
                    <p>
                      <strong>Step 4:</strong> All token holders receive
                      notification
                    </p>
                    <p>
                      <strong>Step 5:</strong> Token holders vote
                      (For/Against/Abstain)
                    </p>
                    <p>
                      <strong>Step 6:</strong> Voting weight based on token
                      balance
                    </p>
                    <p>
                      <strong>Step 7:</strong> After voting ends, system checks
                      quorum (50%) and approval (60%)
                    </p>
                    <p>
                      <strong>Step 8:</strong> If approved, funds are locked and
                      action is executed
                    </p>
                    <p>
                      <strong>Step 9:</strong> Funds released after execution
                      confirmation
                    </p>
                  </div>
                }
                technicalPerspective={
                  <div className="space-y-2 text-sm font-mono">
                    <p>
                      <strong>Component:</strong>{" "}
                      <code>ProposalCreator.tsx</code>
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>create-proposal</code>
                    </p>
                    <p className="ml-4">
                      → INSERT: <code>governance_proposals</code> table
                    </p>
                    <p className="ml-4">→ Status: draft → active</p>
                    <p className="ml-4">
                      → approval_threshold: 60%, quorum_required: 50%
                    </p>
                    <p>
                      <strong>Smart Contract:</strong>
                    </p>
                    <p className="ml-4">
                      → <code>contractService.registerProposalOnChain()</code>
                    </p>
                    <p className="ml-4">
                      → <code>GovernanceExecutor.sol::registerProposal()</code>
                    </p>
                    <p className="ml-4">
                      → Returns: contract_proposal_id, tx_hash
                    </p>
                    <p>
                      <strong>Voting:</strong>
                    </p>
                    <p className="ml-4">→ User clicks Vote button</p>
                    <p className="ml-4">
                      → Voting weight = token_holdings.balance
                    </p>
                    <p className="ml-4">
                      → INSERT: <code>governance_votes</code> table
                    </p>
                    <p className="ml-4">
                      → UPDATE: proposal counters (votes_for, votes_against)
                    </p>
                    <p>
                      <strong>Vote Counting:</strong>
                    </p>
                    <p className="ml-4">
                      → Turnout = (total_votes_cast / total_tokens) × 100
                    </p>
                    <p className="ml-4">
                      → Approval = (votes_for / total_votes_cast) × 100
                    </p>
                    <p className="ml-4">
                      → IF turnout ≥ quorum AND approval ≥ threshold
                    </p>
                    <p className="ml-4">→ THEN status = approved</p>
                    <p>
                      <strong>Execution:</strong>
                    </p>
                    <p className="ml-4">
                      → <code>execute-proposal</code> edge function
                    </p>
                    <p className="ml-4">→ funds_locked = true</p>
                    <p className="ml-4">
                      → <code>GovernanceExecutor.sol::executeProposal()</code>
                    </p>
                    <p className="ml-4">→ execution_status: completed</p>
                  </div>
                }
              />
            </section>

            {/* MultiSig Treasury */}
            <section id="multisig">
              <FlowDiagram
                title="7. MultiSig Treasury Withdrawal"
                description="Secure multi-signature approval for treasury withdrawals"
                mermaidCode={`graph TD
    A[Property Owner: Submit Withdrawal] --> B[Enter Amount & Reason]
    B --> C[Submit Request]
    C --> D{Verify: Is User a Signer?}
    D -->|No| E[Unauthorized]
    D -->|Yes| F[Create Transaction Record]
    F --> G[Submit to MultiSigTreasury.sol]
    G --> H[Notify All Signers]
    H --> I{First Signer Approval}
    I --> J[Signer 1 Reviews]
    J --> K{Approve or Reject?}
    K -->|Reject| L[Request Cancelled]
    K -->|Approve| M[Call approveWithdrawal]
    M --> N[Update Approvers List]
    N --> O{Check Threshold: 2-of-2}
    O -->|Not Met| P[Wait for Second Approval]
    P --> Q{Second Signer Approval}
    Q --> R[Signer 2 Reviews]
    R --> S{Approve?}
    S -->|No| L
    S -->|Yes| T[Call approveWithdrawal]
    T --> U[Threshold Met: 2/2 Approvals]
    U --> V[Auto-Execute Withdrawal]
    V --> W[executeWithdrawal on Contract]
    W --> X[Transfer Funds to Recipient]
    X --> Y[Status: Completed]
    Y --> Z[Create Activity Logs]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style G fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style U fill:#10b981,stroke:#059669,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style L fill:#ef4444,stroke:#dc2626,color:#fff`}
                userPerspective={
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Step 1:</strong> Property owner submits withdrawal
                      request
                    </p>
                    <p>
                      <strong>Step 2:</strong> Enters amount, recipient, and
                      reason
                    </p>
                    <p>
                      <strong>Step 3:</strong> Request is submitted to smart
                      contract
                    </p>
                    <p>
                      <strong>Step 4:</strong> All signers (owner + platform
                      admin) receive notification
                    </p>
                    <p>
                      <strong>Step 5:</strong> First signer reviews and approves
                    </p>
                    <p>
                      <strong>Step 6:</strong> Second signer reviews and
                      approves
                    </p>
                    <p>
                      <strong>Step 7:</strong> After 2-of-2 approvals,
                      withdrawal executes automatically
                    </p>
                    <p>
                      <strong>Step 8:</strong> Funds transferred to specified
                      recipient
                    </p>
                    <p>
                      <strong>Note:</strong> Each property has a unique MultiSig
                      contract deployed
                    </p>
                  </div>
                }
                technicalPerspective={
                  <div className="space-y-2 text-sm font-mono">
                    <p>
                      <strong>Component:</strong>{" "}
                      <code>MultiSigWithdrawalCard.tsx</code>
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>submit-treasury-withdrawal</code>
                    </p>
                    <p className="ml-4">
                      → Validate: user IN tokenizations.treasury_signers
                    </p>
                    <p className="ml-4">
                      → INSERT: <code>property_treasury_transactions</code>
                    </p>
                    <p className="ml-4">→ status: pending_approval</p>
                    <p className="ml-4">
                      → metadata: {"{"} approvers: [], request_id: X {"}"}
                    </p>
                    <p>
                      <strong>Smart Contract Submission:</strong>
                    </p>
                    <p className="ml-4">
                      → <code>contractService.submitTreasuryWithdrawal()</code>
                    </p>
                    <p className="ml-4">
                      →{" "}
                      <code>
                        MultiSigTreasury.sol::submitWithdrawal(amount,
                        recipient)
                      </code>
                    </p>
                    <p className="ml-4">
                      → Returns: requestId, transactionHash
                    </p>
                    <p>
                      <strong>Approval Process:</strong>
                    </p>
                    <p className="ml-4">
                      → <code>approve-treasury-withdrawal</code> edge function
                    </p>
                    <p className="ml-4">→ Verify: user is authorized signer</p>
                    <p className="ml-4">
                      → Check: user NOT in metadata.approvers
                    </p>
                    <p className="ml-4">
                      →{" "}
                      <code>
                        contractService.approveTreasuryWithdrawal(requestId)
                      </code>
                    </p>
                    <p className="ml-4">
                      →{" "}
                      <code>
                        MultiSigTreasury.sol::approveWithdrawal(requestId)
                      </code>
                    </p>
                    <p className="ml-4">
                      → UPDATE: metadata.approvers.push(user.id)
                    </p>
                    <p>
                      <strong>Auto-Execution:</strong>
                    </p>
                    <p className="ml-4">
                      → IF approvers.length == treasury_threshold (2)
                    </p>
                    <p className="ml-4">
                      → THEN: <code>execute-treasury-withdrawal</code>
                    </p>
                    <p className="ml-4">
                      →{" "}
                      <code>
                        MultiSigTreasury.sol::executeWithdrawal(requestId)
                      </code>
                    </p>
                    <p className="ml-4">
                      → Contract verifies: approvalCount ≥ requiredApprovals
                    </p>
                    <p className="ml-4">→ Transfer: funds to recipient</p>
                    <p className="ml-4">→ Emit: WithdrawalExecuted event</p>
                    <p className="ml-4">→ UPDATE: status = completed</p>
                    <p>
                      <strong>Database Schema:</strong>
                    </p>
                    <p className="ml-4">
                      → <code>tokenizations.treasury_signers</code>: [owner_id,
                      admin_id]
                    </p>
                    <p className="ml-4">
                      → <code>tokenizations.treasury_threshold</code>: 2
                    </p>
                    <p className="ml-4">
                      → <code>tokenizations.multisig_treasury_address</code>:
                      0xabc...
                    </p>
                  </div>
                }
              />
            </section>

            {/* Document Verification */}
            <section id="verification">
              <FlowDiagram
                title="8. Document Verification"
                description="Blockchain-backed certificate verification"
                mermaidCode={`graph TD
    A[👤 User: Receive Investment Certificate] --> B[📄 PDF with QR Code]
    B --> C[📱 Scan QR Code]
    C --> D[🌐 Navigate to /verify/:documentNumber]
    D --> E[🔍 Query Database]
    E --> F[💾 Fetch Document Record]
    F --> G[⛓️ Fetch HCS Record]
    G --> H[🔗 Call Hedera Mirror Node API]
    H --> I[📝 Retrieve Blockchain Message]
    I --> J[🔐 Compare Document Hash]
    J --> K{✅ Hashes Match?}
    K -->|Yes| L[✅ Document Verified]
    K -->|No| M[⚠️ Potential Tampering]
    L --> N[📊 Display Details]
    M --> N
    N --> O[🔗 Link to View on HashScan]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style L fill:#10b981,stroke:#059669,color:#fff
    style M fill:#f59e0b,stroke:#d97706,color:#fff`}
                userPerspective={
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Step 1:</strong> Investor receives investment
                      certificate PDF via email
                    </p>
                    <p>
                      <strong>Step 2:</strong> Certificate contains QR code for
                      verification
                    </p>
                    <p>
                      <strong>Step 3:</strong> Scan QR code with phone camera
                    </p>
                    <p>
                      <strong>Step 4:</strong> Browser opens verification page
                    </p>
                    <p>
                      <strong>Step 5:</strong> Page shows document details
                      verified against blockchain
                    </p>
                    <p>
                      <strong>Step 6:</strong> Green checkmark if document is
                      authentic
                    </p>
                    <p>
                      <strong>Step 7:</strong> Warning if document has been
                      tampered with
                    </p>
                    <p>
                      <strong>Step 8:</strong> Link to view transaction on
                      HashScan explorer
                    </p>
                  </div>
                }
                technicalPerspective={
                  <div className="space-y-2 text-sm font-mono">
                    <p>
                      <strong>Component:</strong>{" "}
                      <code>VerifyDocument.tsx</code>
                    </p>
                    <p>
                      <strong>Route:</strong>{" "}
                      <code>/verify/:documentNumber</code>
                    </p>
                    <p>
                      <strong>Database Query:</strong>
                    </p>
                    <p className="ml-4">
                      → SELECT * FROM <code>investment_documents</code>
                    </p>
                    <p className="ml-4">
                      → WHERE document_number = :documentNumber
                    </p>
                    <p className="ml-4">
                      → Returns: document_url, document_hash,
                      hcs_verification_id
                    </p>
                    <p>
                      <strong>Edge Function:</strong>{" "}
                      <code>get-hcs-messages</code>
                    </p>
                    <p className="ml-4">→ Hedera Mirror Node API:</p>
                    <p className="ml-4">
                      → GET /api/v1/topics/{"{"}topicId{"}"}/messages/{"{"}
                      sequenceNumber{"}"}
                    </p>
                    <p className="ml-4">
                      → Returns: consensus_timestamp, message (base64)
                    </p>
                    <p>
                      <strong>Verification Logic:</strong>
                    </p>
                    <p className="ml-4">→ Decode HCS message → JSON payload</p>
                    <p className="ml-4">
                      → Compare: document_hash (DB) vs hash (HCS)
                    </p>
                    <p className="ml-4">
                      → IF match: "✅ Verified on blockchain"
                    </p>
                    <p className="ml-4">
                      → IF mismatch: "⚠️ Document may be tampered"
                    </p>
                    <p>
                      <strong>Display Details:</strong>
                    </p>
                    <p className="ml-4">
                      → Investment amount, property details
                    </p>
                    <p className="ml-4">→ Document generation date</p>
                    <p className="ml-4">→ Blockchain consensus timestamp</p>
                    <p className="ml-4">→ Link to HashScan explorer</p>
                  </div>
                }
              />
            </section>

            <Separator />

            {/* Database Schema */}
            <section id="database">
              <DatabaseSchema />
            </section>

            <Separator />

            {/* Tech Stack */}
            <section id="tech-stack">
              <TechStack />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDocumentation;
