import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, Search, Wallet, Building2, Coins, TrendingUp, Users, FileCheck, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserCheck,
      title: "Complete KYC Verification",
      description: "Start your investment journey by completing our secure KYC process. We verify your identity to comply with SEC regulations and ensure a safe investment environment for all users.",
      details: [
        "Upload government-issued ID",
        "Verify your address",
        "Complete identity verification",
        "Get approved within 24-48 hours"
      ],
      color: "from-primary/20 to-primary/5"
    },
    {
      number: "02",
      icon: Search,
      title: "Browse & Research Properties",
      description: "Explore our curated selection of verified properties. Each listing includes comprehensive details, financial projections, location insights, and legal documentation.",
      details: [
        "View detailed property analytics",
        "Review financial projections",
        "Access legal documents",
        "Compare investment opportunities"
      ],
      color: "from-blue-500/20 to-blue-500/5"
    },
    {
      number: "03",
      icon: Wallet,
      title: "Fund Your Wallet",
      description: "Add funds to your PropChain wallet using multiple payment methods. Your funds are securely held and ready for instant property investments.",
      details: [
        "Bank transfer support",
        "Card payment options",
        "Instant wallet funding",
        "Secure payment processing via Paystack"
      ],
      color: "from-green-500/20 to-green-500/5"
    },
    {
      number: "04",
      icon: Building2,
      title: "Invest in Properties",
      description: "Choose your investment amount starting from as little as ₦10,000. Own fractional shares of premium properties and start building your real estate portfolio.",
      details: [
        "Minimum investment: ₦10,000",
        "Fractional ownership model",
        "Transparent pricing",
        "Instant investment confirmation"
      ],
      color: "from-orange-500/20 to-orange-500/5"
    },
    {
      number: "05",
      icon: Coins,
      title: "Receive Digital Tokens",
      description: "Your ownership is represented by digital tokens on the Hedera network. These tokens are proof of your fractional ownership and can be managed in your portfolio.",
      details: [
        "Hedera-based token ownership",
        "Immutable ownership records",
        "Transparent transaction history",
        "Secure wallet integration"
      ],
      color: "from-purple-500/20 to-purple-500/5"
    },
    {
      number: "06",
      icon: TrendingUp,
      title: "Earn Returns",
      description: "Start earning passive income through rental yields and benefit from property appreciation. Dividends are distributed quarterly directly to your wallet.",
      details: [
        "Quarterly dividend distributions",
        "Rental income returns",
        "Property value appreciation",
        "Transparent earnings tracking"
      ],
      color: "from-pink-500/20 to-pink-500/5"
    }
  ];

  const advantages = [
    {
      icon: Shield,
      title: "SEC Regulated",
      description: "All properties are registered and regulated by the Securities and Exchange Commission, Nigeria."
    },
    {
      icon: FileCheck,
      title: "Legal Compliance",
      description: "Full legal documentation and compliance with Nigerian property and securities laws."
    },
    {
      icon: Users,
      title: "Democratic Governance",
      description: "Token holders can participate in major property decisions through our governance system."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">Investment Process</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How PropChain Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              From registration to earning returns, here's your complete guide to investing in Nigerian real estate through PropChain
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className={`p-8 md:p-12 bg-gradient-to-br ${step.color}`}>
                        <div className="flex items-start gap-4 mb-6">
                          <span className="text-5xl font-bold text-muted-foreground/30">{step.number}</span>
                          <div className="flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <step.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 md:p-12">
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Key Points</h4>
                        <ul className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PropChain?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We combine traditional real estate investment with modern technology and regulatory compliance
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <advantage.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{advantage.title}</h3>
                    <p className="text-muted-foreground">{advantage.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Investing?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of Nigerians building wealth through fractional real estate ownership
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth/signup">Get Started Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/browse">Browse Properties</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
