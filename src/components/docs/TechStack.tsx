import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TechStack = () => {
  const technologies = [
    {
      category: "Frontend",
      items: [
        { name: "React 18", description: "UI framework with hooks and modern patterns" },
        { name: "TypeScript", description: "Type-safe JavaScript for better DX" },
        { name: "Tailwind CSS", description: "Utility-first CSS framework" },
        { name: "Shadcn UI", description: "Accessible component library" },
        { name: "TanStack Query", description: "Data fetching and caching" },
        { name: "React Router", description: "Client-side routing" },
      ],
    },
    {
      category: "Backend",
      items: [
        { name: "Supabase", description: "PostgreSQL database + Auth + Storage" },
        { name: "Supabase Edge Functions", description: "Serverless functions on Deno runtime" },
        { name: "Deno", description: "Secure TypeScript runtime for edge functions" },
      ],
    },
    {
      category: "Blockchain (Hedera Hashgraph)",
      items: [
        { name: "Hedera Token Service (HTS)", description: "Native token creation and management" },
        { name: "Hedera Consensus Service (HCS)", description: "Immutable audit logs and messaging" },
        { name: "Hedera File Service (HFS)", description: "Decentralized document storage" },
        { name: "Hedera Smart Contracts", description: "EVM-compatible smart contracts (Solidity)" },
        { name: "Hedera SDK (@hashgraph/sdk)", description: "JavaScript SDK for Hedera operations" },
      ],
    },
    {
      category: "Smart Contracts",
      items: [
        { name: "Solidity", description: "Smart contract programming language" },
        { name: "Hardhat", description: "Ethereum/Hedera development environment" },
        { name: "MultiSigTreasury.sol", description: "Multi-signature wallet for property treasuries" },
        { name: "GovernanceExecutor.sol", description: "On-chain governance and voting" },
        { name: "DividendDistributor.sol", description: "Automated dividend distribution" },
        { name: "PlatformEscrowManager.sol", description: "Investment escrow management" },
      ],
    },
    {
      category: "Payment Integration",
      items: [
        { name: "Paystack", description: "Nigerian payment gateway (NGN fiat)" },
        { name: "USDC", description: "Stablecoin for crypto payments on Hedera" },
        { name: "HBAR", description: "Native Hedera cryptocurrency" },
      ],
    },
    {
      category: "Document Generation",
      items: [
        { name: "@react-pdf/renderer", description: "PDF generation for investment certificates" },
        { name: "QR Code Generation", description: "Verification QR codes on certificates" },
        { name: "SHA-256 Hashing", description: "Document integrity verification" },
      ],
    },
    {
      category: "Development Tools",
      items: [
        { name: "Vite", description: "Fast build tool and dev server" },
        { name: "ESLint", description: "Code linting and quality" },
        { name: "Git", description: "Version control" },
        { name: "Vercel", description: "Deployment and hosting" },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology Stack</CardTitle>
        <CardDescription>
          Comprehensive overview of all technologies and frameworks used in PropChain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {technologies.map((tech, index) => (
          <div key={tech.category}>
            <h3 className="text-lg font-semibold text-foreground mb-3">{tech.category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tech.items.map((item) => (
                <div key={item.name} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{item.name}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            {index < technologies.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}

        <Separator />

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">Architecture Highlights</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ <strong>Hybrid Architecture:</strong> Combines centralized database (Supabase) with decentralized blockchain (Hedera)</li>
            <li>✅ <strong>Smart Contract Integration:</strong> On-chain governance, MultiSig treasury, and dividend distribution</li>
            <li>✅ <strong>HCS for Audit Logs:</strong> All property events and documents logged immutably on HCS</li>
            <li>✅ <strong>HTS for Tokenization:</strong> Native Hedera tokens for fractional ownership</li>
            <li>✅ <strong>Edge Functions for Automation:</strong> Serverless functions handle complex business logic</li>
            <li>✅ <strong>Multi-Payment Support:</strong> Fiat (NGN via Paystack) and crypto (HBAR/USDC)</li>
            <li>✅ <strong>KYC Compliance:</strong> Required for token distribution and dividend claims</li>
            <li>✅ <strong>Document Verification:</strong> Blockchain-backed certificates with QR codes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechStack;
