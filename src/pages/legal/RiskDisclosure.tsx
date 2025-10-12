import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  Building,
  Zap,
  Globe,
  Lock,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function RiskDisclosure() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 150) {
          current = section.getAttribute("id") || "";
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const sections = [
    { id: "real-estate", title: "Real Estate Risks" },
    { id: "technology", title: "Technology & Blockchain" },
    { id: "regulatory", title: "Regulatory & Legal" },
    { id: "nigerian", title: "Nigerian Market Risks" },
    { id: "mitigation", title: "Risk Mitigation" },
    { id: "acknowledgment", title: "Acknowledgment" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto mobile-padding relative">
          <Link to="/">
            <Button
              variant="outline"
              className="mb-6 hover:bg-primary/10 transition-colors border-primary/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <Badge className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 text-sm px-5 py-2" variant="outline">
              <Sparkles className="w-3 h-3 mr-2" />
              Risk Disclosure
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Risk Disclosure Statement
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge variant="secondary" className="px-4 py-1.5">
                Last updated: January 2025
              </Badge>
              <span className="text-muted-foreground">15 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 relative">
        <div className="container mx-auto mobile-padding">
          <div className="flex gap-8 max-w-7xl mx-auto">
          {/* Table of Contents - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Contents
              </h3>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8 max-w-4xl">
            {/* Critical Warning */}
            <Card className="border bg-card/80 backdrop-blur-sm overflow-hidden bg-gradient-to-br from-red-600/15 to-transparent border-2 border-red-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700 dark:text-red-400 text-2xl">
                  <ShieldAlert className="h-8 w-8" />
                  IMPORTANT RISK WARNING
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground font-bold text-lg">
                  REAL ESTATE TOKENIZATION INVOLVES SIGNIFICANT FINANCIAL RISKS
                </p>
                <div className="bg-background border-2 border-red-600/30 rounded-xl p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                    <p className="text-foreground font-semibold text-lg">
                      You may lose some or all of your invested capital
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                    <p className="text-foreground font-semibold text-lg">
                      Tokens may have limited or no liquidity
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                    <p className="text-foreground font-semibold text-lg">
                      Property values can decrease significantly
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                    <p className="text-foreground font-semibold text-lg">
                      Dividend payments are not guaranteed
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                    <p className="text-foreground font-semibold text-lg">
                      Technology and regulatory risks apply
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-center pt-4 border-t border-red-600/20">
                  Only invest money you can afford to lose. Seek independent
                  financial advice if you are unsure about the suitability of
                  this investment.
                </p>
              </CardContent>
            </Card>

            {/* Risk Categories */}
            <div className="space-y-12">
              <section id="real-estate">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Real Estate Investment Risks
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-orange-300 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900/50">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg text-orange-900 dark:text-orange-100 flex items-center gap-2">
                          <TrendingDown className="h-5 w-5" />
                          Market Risk
                        </CardTitle>
                        <Badge variant="destructive" className="bg-red-600 text-white">
                          High Risk
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-2 text-orange-800 dark:text-orange-200 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Property values may decline due to market conditions
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Economic downturns can severely impact real estate
                            prices
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Interest rate changes affect property valuations
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Local market factors may negatively impact specific
                            properties
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Supply and demand imbalances in the real estate
                            market
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/50">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg text-amber-900 dark:text-amber-100 flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Property-Specific Risk
                        </CardTitle>
                        <Badge className="bg-amber-600 text-white">
                          Medium-High
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-2 text-amber-800 dark:text-amber-200 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1 text-lg">•</span>
                          <span>
                            Structural damage, natural disasters, or force
                            majeure events
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1 text-lg">•</span>
                          <span>
                            Tenant vacancies resulting in reduced rental income
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1 text-lg">•</span>
                          <span>
                            Maintenance and repair costs exceeding expectations
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1 text-lg">•</span>
                          <span>Zoning changes or regulatory restrictions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1 text-lg">•</span>
                          <span>
                            Environmental liabilities or contamination issues
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-red-300 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950 dark:to-red-900/50">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg text-red-900 dark:text-red-100">
                          Liquidity Risk
                        </CardTitle>
                        <Badge variant="destructive" className="bg-red-700 text-white">
                          Very High
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1 text-lg">•</span>
                          <span>
                            Tokens may not be easily tradeable or sellable
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1 text-lg">•</span>
                          <span>
                            Limited secondary market for real estate tokens
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1 text-lg">•</span>
                          <span>Long holding periods may be required</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1 text-lg">•</span>
                          <span>Emergency liquidation may not be possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1 text-lg">•</span>
                          <span>
                            Price discovery mechanisms may be inefficient
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-yellow-300 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950 dark:to-yellow-900/50">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg text-yellow-900 dark:text-yellow-100">
                          Income Risk
                        </CardTitle>
                        <Badge className="bg-yellow-600 text-white">
                          Medium
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-2 text-yellow-800 dark:text-yellow-200 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Rental income may be irregular or cease entirely
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1 text-lg">
                            •
                          </span>
                          <span>Dividend payments are not guaranteed</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Operating expenses may exceed rental income
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Property management issues affecting returns
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1 text-lg">
                            •
                          </span>
                          <span>
                            Currency fluctuation risks for international
                            investors
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="technology">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Technology and Blockchain Risks
                  </h2>
                </div>

                <div className="space-y-6">
                  <Card className="border border-purple-300 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                        Blockchain Technology Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-purple-800 dark:text-purple-200">
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Smart Contract Vulnerabilities:
                            </span>
                            <span className="ml-1">
                              Bugs or exploits in smart contracts could result
                              in loss of funds
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Network Risks:
                            </span>
                            <span className="ml-1">
                              Hedera network downtime, congestion, or technical
                              failures
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Key Management:
                            </span>
                            <span className="ml-1">
                              Loss of private keys results in permanent loss of
                              token access
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Protocol Changes:
                            </span>
                            <span className="ml-1">
                              Updates to the Hedera protocol may affect token
                              functionality
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Cybersecurity:
                            </span>
                            <span className="ml-1">
                              Hacking attempts on wallets, exchanges, or
                              platform infrastructure
                            </span>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950 dark:to-indigo-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100">
                        Platform and Operational Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-indigo-800 dark:text-indigo-200">
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Platform Failure:
                            </span>
                            <span className="ml-1">
                              Technical issues or business failure of PropChain
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">Custody Risk:</span>
                            <span className="ml-1">
                              Risks associated with token custody and wallet
                              security
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Operational Errors:
                            </span>
                            <span className="ml-1">
                              Human errors in platform operations or property
                              management
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Third-Party Dependencies:
                            </span>
                            <span className="ml-1">
                              Reliance on external service providers and
                              integrations
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Data Breaches:
                            </span>
                            <span className="ml-1">
                              Unauthorized access to personal or financial
                              information
                            </span>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="regulatory">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Regulatory and Legal Risks
                  </h2>
                </div>

                <div className="space-y-6">
                  <Card className="border border-green-300 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-900 dark:text-green-100">
                        Regulatory Uncertainty
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-green-800 dark:text-green-200">
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Changing Regulations:
                            </span>
                            <span className="ml-1">
                              New laws may restrict or prohibit tokenized real
                              estate
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Compliance Costs:
                            </span>
                            <span className="ml-1">
                              Regulatory compliance may increase operational
                              costs
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Legal Classification:
                            </span>
                            <span className="ml-1">
                              Uncertainty about legal status of real estate
                              tokens
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Cross-Border Issues:
                            </span>
                            <span className="ml-1">
                              International regulatory conflicts and
                              restrictions
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Tax Implications:
                            </span>
                            <span className="ml-1">
                              Unclear or changing tax treatment of token
                              investments
                            </span>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-blue-300 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                        Legal and Contractual Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-blue-800 dark:text-blue-200">
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Property Rights:
                            </span>
                            <span className="ml-1">
                              Disputes over underlying property ownership or
                              title
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Legal Enforceability:
                            </span>
                            <span className="ml-1">
                              Challenges in enforcing token holder rights
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Jurisdiction Issues:
                            </span>
                            <span className="ml-1">
                              Unclear legal jurisdiction for dispute resolution
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Corporate Structure:
                            </span>
                            <span className="ml-1">
                              Risks related to the legal structure of tokenized
                              properties
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Documentation Risk:
                            </span>
                            <span className="ml-1">
                              Inadequate or unclear legal documentation
                            </span>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="nigerian">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">4</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Nigerian Market Specific Risks
                  </h2>
                </div>
                <Card className="border bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-amber-500">
                  <CardContent className="pt-6">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold">Currency Risk:</span>
                          <span className="ml-1">
                            Nigerian Naira volatility affecting property values
                            and returns
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold">Political Risk:</span>
                          <span className="ml-1">
                            Changes in government policies affecting real estate
                            or blockchain
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold">
                            Economic Instability:
                          </span>
                          <span className="ml-1">
                            Inflation, recession, or economic crises impact
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold">
                            Infrastructure Risk:
                          </span>
                          <span className="ml-1">
                            Power, internet, or other infrastructure limitations
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold">Legal System:</span>
                          <span className="ml-1">
                            Challenges with property registration and legal
                            enforcement
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold">
                            Market Development:
                          </span>
                          <span className="ml-1">
                            Relatively nascent real estate tokenization market
                          </span>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <section id="mitigation">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">5</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Risk Mitigation Measures
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        PropChain's Risk Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>
                            Due diligence on all properties before tokenization
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>
                            Professional property valuations and regular updates
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>
                            Insurance coverage for physical property risks
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>
                            Regular security audits and penetration testing
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>Compliance with regulatory requirements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>
                            Diversification across multiple properties and
                            markets
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">
                        Investor Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">→</span>
                          <span>
                            Only invest amounts you can afford to lose entirely
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">→</span>
                          <span>
                            Diversify across multiple properties and asset
                            classes
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">→</span>
                          <span>
                            Understand the technology and risks before investing
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">→</span>
                          <span>
                            Keep secure backups of wallet keys and credentials
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">→</span>
                          <span>Monitor your investments regularly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">→</span>
                          <span>
                            Seek professional financial advice when needed
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="acknowledgment">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">6</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Acknowledgment
                  </h2>
                </div>
                <Card className="border bg-card/80 backdrop-blur-sm overflow-hidden bg-gradient-to-br from-destructive/10 to-transparent border-2 border-destructive/30">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-foreground font-semibold text-lg">
                        By using PropChain's services, you acknowledge that:
                      </p>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1 text-lg">•</span>
                          <span>
                            You have read and understood all risks outlined in
                            this disclosure
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1 text-lg">•</span>
                          <span>
                            You understand that past performance does not
                            guarantee future results
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1 text-lg">•</span>
                          <span>
                            You accept full responsibility for your investment
                            decisions
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1 text-lg">•</span>
                          <span>
                            You have the financial capacity to bear potential
                            losses
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1 text-lg">•</span>
                          <span>
                            You will not rely solely on PropChain for investment
                            advice
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1 text-lg">•</span>
                          <span>
                            You understand the speculative nature of real estate
                            tokenization
                          </span>
                        </li>
                      </ul>
                      <div className="bg-background border-2 border-red-600/40 rounded-xl p-6 mt-6">
                        <p className="text-foreground font-bold text-center text-xl">
                          THIS INVESTMENT IS SUITABLE ONLY FOR SOPHISTICATED
                          INVESTORS WHO FULLY UNDERSTAND THE RISKS INVOLVED
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Contact Information */}
            <Card className="border bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  Questions About Risks?
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-foreground mb-4">
                  If you have questions about these risks or need clarification:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Risk Queries
                    </p>
                    <p className="text-muted-foreground">risk@propchain.ng</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Investment Support
                    </p>
                    <p className="text-muted-foreground">
                      support@propchain.ng
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Regulatory Queries
                    </p>
                    <p className="text-muted-foreground">
                      compliance@propchain.ng
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-6 pt-4 border-t">
                  This risk disclosure statement does not constitute investment
                  advice. Always consult with qualified financial advisors
                  before making investment decisions.
                </p>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
