import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  Search,
  Wallet,
  Building2,
  Coins,
  TrendingUp,
  Users,
  FileCheck,
  Shield,
  ArrowRight,
  Upload,
  MapPin,
  CreditCard,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserCheck,
      title: "Complete KYC Verification",
      description:
        "Start your investment journey by completing our secure KYC process. We verify your identity to comply with SEC regulations and ensure a safe investment environment for all users.",
      details: [
        "Upload government-issued ID",
        "Verify your address",
        "Complete identity verification",
        "Get approved within 24-48 hours",
      ],
      color: "from-primary/20 to-primary/5",
    },
    {
      number: "02",
      icon: Search,
      title: "Browse & Research Properties",
      description:
        "Explore our curated selection of verified properties. Each listing includes comprehensive details, financial projections, location insights, and legal documentation.",
      details: [
        "View detailed property analytics",
        "Review financial projections",
        "Access legal documents",
        "Compare investment opportunities",
      ],
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      number: "03",
      icon: Wallet,
      title: "Fund Your Wallet",
      description:
        "Add funds to your PropChain wallet using multiple payment methods. Your funds are securely held and ready for instant property investments.",
      details: [
        "Bank transfer support",
        "Card payment options",
        "Instant wallet funding",
        "Secure payment processing via Paystack",
      ],
      color: "from-green-500/20 to-green-500/5",
    },
    {
      number: "04",
      icon: Building2,
      title: "Invest in Properties",
      description:
        "Choose your investment amount starting from as little as ₦10,000. Own fractional shares of premium properties and start building your real estate portfolio.",
      details: [
        "Minimum investment: ₦10,000",
        "Fractional ownership model",
        "Transparent pricing",
        "Instant investment confirmation",
      ],
      color: "from-orange-500/20 to-orange-500/5",
    },
    {
      number: "05",
      icon: Coins,
      title: "Receive Digital Tokens",
      description:
        "Your ownership is represented by digital tokens on the Hedera network. These tokens are proof of your fractional ownership and can be managed in your portfolio.",
      details: [
        "Hedera-based token ownership",
        "Immutable ownership records",
        "Transparent transaction history",
        "Secure wallet integration",
      ],
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      number: "06",
      icon: TrendingUp,
      title: "Earn Returns",
      description:
        "Start earning passive income through rental yields and benefit from property appreciation. Dividends are distributed quarterly directly to your wallet.",
      details: [
        "Quarterly dividend distributions",
        "Rental income returns",
        "Property value appreciation",
        "Transparent earnings tracking",
      ],
      color: "from-pink-500/20 to-pink-500/5",
    },
  ];

  const advantages = [
    {
      icon: Shield,
      title: "SEC Regulated",
      description:
        "All properties are registered and regulated by the Securities and Exchange Commission, Nigeria.",
    },
    {
      icon: FileCheck,
      title: "Legal Compliance",
      description:
        "Full legal documentation and compliance with Nigerian property and securities laws.",
    },
    {
      icon: Users,
      title: "Democratic Governance",
      description:
        "Token holders can participate in major property decisions through our governance system.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              Investment Process
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How PropChain Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              From registration to earning returns, here's your complete guide
              to investing in Nigerian real estate through PropChain
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
                <Card
                  key={index}
                  className="overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 items-stretch min-h-[500px]">
                      <div
                        className={`p-8 md:p-12 bg-gradient-to-br ${
                          step.color
                        } flex flex-col justify-center ${
                          index % 2 === 0 ? "order-1" : "order-2"
                        }`}
                      >
                        <div className="flex items-start gap-4 mb-6">
                          <span className="text-5xl font-bold text-muted-foreground/30">
                            {step.number}
                          </span>
                          <div className="flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <step.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">
                              {step.title}
                            </h3>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                              {step.description}
                            </p>
                            <div className="space-y-3">
                              {step.details.map((detail, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3"
                                >
                                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <ArrowRight className="w-3 h-3 text-primary" />
                                  </div>
                                  <span className="text-sm">{detail}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`p-8 md:p-12 flex items-center justify-center ${
                          index % 2 === 0 ? "order-2" : "order-1"
                        }`}
                      >
                        <div className="relative w-full max-w-md">
                          {index === 0 && (
                            <>
                              <Card className="relative z-30 bg-card border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Upload className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">
                                        Upload ID Document
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Government issued ID
                                      </p>
                                    </div>
                                  </div>
                                  <div className="w-full h-32 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer group/upload">
                                    <div className="text-center">
                                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover/upload:text-primary group-hover/upload:scale-110 transition-all" />
                                      <p className="text-xs text-muted-foreground">
                                        Click to upload
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-4 flex gap-2">
                                    <div className="h-1 flex-1 bg-primary rounded-full"></div>
                                    <div className="h-1 flex-1 bg-muted rounded-full"></div>
                                    <div className="h-1 flex-1 bg-muted rounded-full"></div>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="absolute top-8 -right-4 z-20 bg-card border shadow-lg w-[90%] rotate-3 hover:rotate-1 transition-all duration-300">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-3">
                                    <MapPin className="w-5 h-5 text-primary animate-pulse" />
                                    <span className="font-semibold text-sm">
                                      Verify Address
                                    </span>
                                  </div>
                                  <input
                                    className="w-full p-2 bg-background border border-border rounded text-xs"
                                    placeholder="Enter your address"
                                  />
                                  <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      <span>Verified</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="absolute top-16 -right-8 z-10 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 shadow-md w-[85%] rotate-6 hover:rotate-3 transition-all duration-300">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 animate-pulse" />
                                    <span className="font-semibold text-sm">
                                      Verification Complete
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          )}
                          {index === 1 && (
                            <>
                              <Card className="relative z-30 bg-card border-2 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group/property">
                                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] group-hover/property:scale-110 transition-transform duration-500"></div>
                                  <div className="absolute top-3 right-3">
                                    <Badge className="bg-background/80 backdrop-blur-sm">
                                      Featured
                                    </Badge>
                                  </div>
                                </div>
                                <CardContent className="p-5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="text-xs">Premium</Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Verified
                                    </Badge>
                                  </div>
                                  <h4 className="font-bold text-lg mb-1">
                                    Luxury Apartment
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Lekki, Lagos
                                  </p>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold text-primary">
                                      ₦50M
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="bg-green-500/10 text-green-600 border-green-500/20"
                                    >
                                      15% ROI
                                    </Badge>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-primary rounded-full w-[65%] transition-all duration-1000"></div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    65% funded
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="absolute top-6 -right-6 z-20 bg-card border shadow-lg w-[85%] rotate-2 overflow-hidden opacity-80 hover:opacity-100 hover:rotate-1 transition-all duration-300">
                                <div className="h-32 bg-gradient-to-br from-blue-500/20 to-blue-500/5 relative">
                                  <div className="absolute top-2 right-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      New
                                    </Badge>
                                  </div>
                                </div>
                                <CardContent className="p-4">
                                  <h4 className="font-bold text-sm mb-1">
                                    Modern Villa
                                  </h4>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Victoria Island
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold">
                                      ₦75M
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      18% ROI
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          )}
                          {index === 2 && (
                            <>
                              <Card className="relative z-30 bg-gradient-to-br from-card to-primary/5 border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <CardContent className="p-6">
                                  <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 hover:bg-primary/20 transition-colors">
                                      <Wallet className="w-7 h-7 text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      Available Balance
                                    </p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                      ₦150,000
                                    </p>
                                    <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-muted-foreground">
                                          Active
                                        </span>
                                      </div>
                                      <div className="text-muted-foreground">
                                        3 Properties
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    className="w-full group/btn"
                                    size="lg"
                                  >
                                    Fund Wallet
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                  </Button>
                                </CardContent>
                              </Card>
                              <Card className="absolute top-8 -right-4 z-20 bg-card border shadow-lg w-[90%] -rotate-3 hover:-rotate-1 transition-all duration-300">
                                <CardContent className="p-5">
                                  <div className="flex items-center justify-between group/payment cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover/payment:scale-110 transition-transform">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-sm">
                                          Card Payment
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Instant • Secure
                                        </p>
                                      </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/payment:translate-x-1 transition-transform" />
                                  </div>
                                  <div className="mt-3 flex gap-2">
                                    <div className="flex-1 h-8 bg-muted rounded flex items-center justify-center">
                                      <span className="text-xs font-medium">
                                        Paystack
                                      </span>
                                    </div>
                                    <div className="flex-1 h-8 bg-muted rounded flex items-center justify-center">
                                      <span className="text-xs font-medium">
                                        Bank
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          )}
                          {index === 3 && (
                            <>
                              <Card className="relative z-30 bg-card border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                                      <Building2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">
                                        Luxury Apartment
                                      </h4>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Lekki,
                                        Lagos
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-semibold mb-2 block">
                                        Investment Amount
                                      </label>
                                      <div className="relative group/input">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                                          ₦
                                        </span>
                                        <input
                                          className="w-full pl-8 pr-4 py-3 bg-background border-2 border-border rounded-lg text-lg font-bold focus:border-primary transition-colors"
                                          placeholder="50,000"
                                        />
                                      </div>
                                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                        <span>Min: ₦10,000</span>
                                        <span>Max: ₦500,000</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      {["10K", "50K", "100K"].map((amount) => (
                                        <button
                                          key={amount}
                                          className="flex-1 py-2 px-3 bg-muted hover:bg-primary/10 hover:text-primary rounded text-xs font-medium transition-colors"
                                        >
                                          ₦{amount}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="absolute top-8 -right-4 z-20 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg w-[90%] rotate-2 hover:rotate-1 transition-all duration-300">
                                <CardContent className="p-5">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">
                                        Expected ROI
                                      </span>
                                      <span className="text-lg font-bold text-primary">
                                        15% p.a.
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">
                                        Est. Annual Returns
                                      </span>
                                      <span className="text-lg font-bold">
                                        ₦7,500
                                      </span>
                                    </div>
                                    <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-green-600">
                                      <TrendingUp className="w-3 h-3" />
                                      <span>High performing asset</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          )}
                          {index === 4 && (
                            <>
                              <Card className="relative z-30 bg-card border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                                <CardContent className="p-6 relative">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <Coins className="w-6 h-6 text-primary-foreground" />
                                      </div>
                                      <div>
                                        <p className="font-bold">PROP-LA-001</p>
                                        <p className="text-xs text-muted-foreground">
                                          Token ID • NFT
                                        </p>
                                      </div>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 animate-pulse">
                                      Active
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Tokens Owned
                                      </p>
                                      <p className="text-lg font-bold">500</p>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Current Value
                                      </p>
                                      <p className="text-lg font-bold">₦50K</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                                    <span className="text-xs font-medium">
                                      Ownership
                                    </span>
                                    <span className="text-xs font-bold text-primary">
                                      2.5%
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="absolute top-8 -right-4 z-20 bg-card border shadow-lg w-[90%] -rotate-2 hover:-rotate-1 transition-all duration-300">
                                <CardContent className="p-5">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">
                                        Hedera Network
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        DLT secured
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Immutable
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Transparent
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          )}
                          {index === 5 && (
                            <>
                              <Card className="relative z-30 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                                <CardContent className="p-6 relative">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                      <TrendingUp className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="font-semibold text-primary">
                                      Total Returns
                                    </span>
                                  </div>
                                  <p className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                    ₦7,500
                                  </p>
                                  <div className="flex items-center gap-2 mb-4">
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                      +15% this quarter
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      On Track
                                    </Badge>
                                  </div>
                                  <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full w-[75%] animate-pulse"></div>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="absolute top-6 -right-4 z-20 bg-card border shadow-lg w-[90%] rotate-2 hover:rotate-1 transition-all duration-300">
                                <CardContent className="p-5">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold">
                                          Rental Income
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Q1 2025 • Paid
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-lg font-bold text-green-600">
                                      +₦5,000
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="absolute top-12 -right-8 z-10 bg-card border shadow-md w-[85%] rotate-4 opacity-80 hover:opacity-100 hover:rotate-3 transition-all duration-300">
                                <CardContent className="p-5">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold">
                                          Appreciation
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          YTD
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-lg font-bold text-green-600">
                                      +₦2,500
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          )}
                        </div>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose PropChain?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We combine traditional real estate investment with modern
                technology and regulatory compliance
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <advantage.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">
                      {advantage.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {advantage.description}
                    </p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Investing?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of Nigerians building wealth through fractional
              real estate ownership
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

      <Footer />
    </div>
  );
}
