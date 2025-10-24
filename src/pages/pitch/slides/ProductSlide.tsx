import { Wallet, Home, BarChart3, Users, Shield, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ProductSlide = () => {
  const features = [
    {
      icon: Wallet,
      title: "Integrated Wallet",
      description: "Custodial & non-custodial options for seamless transactions",
    },
    {
      icon: Home,
      title: "Property Marketplace",
      description: "Browse and invest in verified, tokenized properties",
    },
    {
      icon: BarChart3,
      title: "Portfolio Dashboard",
      description: "Real-time tracking of investments and returns",
    },
    {
      icon: Users,
      title: "Governance System",
      description: "Vote on property decisions proportional to ownership",
    },
    {
      icon: Shield,
      title: "KYC/AML Compliance",
      description: "Bank-grade verification for regulatory compliance",
    },
    {
      icon: Coins,
      title: "Dividend Distribution",
      description: "Automated rental income payments via smart contracts",
    },
  ];

  return (
    <div className="flex flex-col h-full p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-3">Product Features</h2>
        <p className="text-lg text-muted-foreground">
          A comprehensive platform for tokenized real estate investment
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-center text-muted-foreground">
          <span className="font-semibold text-foreground">Powered by Hedera Hashgraph</span> - Fast, secure, and sustainable blockchain infrastructure
        </p>
      </div>
    </div>
  );
};

export default ProductSlide;
