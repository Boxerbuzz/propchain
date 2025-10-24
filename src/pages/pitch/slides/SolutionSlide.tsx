import { Check, Coins, Lock, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const SolutionSlide = () => {
  const features = [
    {
      icon: Coins,
      title: "Fractional Ownership",
      description: "Invest from as little as $100 in premium real estate",
      highlight: "96% cost reduction",
    },
    {
      icon: Zap,
      title: "Instant Liquidity",
      description: "Trade tokenized property shares on secondary markets",
      highlight: "24/7 trading",
    },
    {
      icon: Lock,
      title: "Blockchain Security",
      description: "Immutable records on Hedera with enterprise-grade security",
      highlight: "Bank-level security",
    },
    {
      icon: TrendingUp,
      title: "Transparent Returns",
      description: "Real-time tracking of rental income and property appreciation",
      highlight: "Live updates",
    },
  ];

  return (
    <div className="flex flex-col h-full p-12">
      <div className="mb-8">
        <Badge className="mb-3">Our Solution</Badge>
        <h2 className="text-4xl font-bold mb-3">HederaSuite Platform</h2>
        <p className="text-lg text-muted-foreground">
          Making real estate investment accessible, liquid, and transparent
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <feature.icon className="h-10 w-10 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  {feature.highlight}
                </Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                <Check className="h-4 w-4" />
                <span>Available Now</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SolutionSlide;
