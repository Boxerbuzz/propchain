import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function TermsOfService() {
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
    { id: "overview", title: "Platform Overview" },
    { id: "eligibility", title: "Eligibility & Registration" },
    { id: "services", title: "Investment Services" },
    { id: "responsibilities", title: "User Responsibilities" },
    { id: "risk", title: "Risk Disclosure" },
    { id: "ip", title: "Intellectual Property" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "dispute", title: "Dispute Resolution" },
    { id: "termination", title: "Termination" },
    { id: "updates", title: "Updates & Changes" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto mobile-padding py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button
              variant="outline"
              className="mb-4 hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Terms of Service
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  Last updated: January 2025
                </span>
                <span className="text-muted-foreground">10 min read</span>
              </div>
            </div>
          </div>
        </div>

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
            {/* Agreement Notice */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-xl">
                  <AlertTriangle className="h-6 w-6" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  By accessing and using PropChain's services, you acknowledge
                  that you have read, understood, and agree to be bound by these
                  Terms of Service. If you do not agree to these terms, please
                  do not use our platform.
                </p>
              </CardContent>
            </Card>

            {/* Terms Sections */}
            <div className="space-y-12">
              <section id="overview">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Platform Overview
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      PropChain is a blockchain-based real estate investment
                      platform operating in Nigeria. We facilitate the
                      tokenization of real estate assets, allowing investors to
                      purchase fractional ownership through digital tokens built
                      on the Hedera Hashgraph network.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Our platform connects property owners seeking to tokenize
                      their assets with investors looking for accessible real
                      estate investment opportunities.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="eligibility">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Eligibility and Account Registration
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Eligibility Requirements
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Must be at least 18 years old</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Must be a resident of Nigeria or eligible
                            jurisdiction
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Must complete our KYC (Know Your Customer)
                            verification process
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Must have the legal capacity to enter into binding
                            agreements
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Must not be on any sanctions or prohibited persons
                            list
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Account Security
                      </h3>
                      <p className="text-muted-foreground mb-2 leading-relaxed">
                        You are responsible for maintaining the security of your
                        account credentials, including your password and any
                        wallet private keys.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Notify us immediately of any unauthorized access or
                        security breaches.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="services">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Investment Services
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Tokenized Real Estate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-muted-foreground">
                            Tokens represent fractional ownership in specific
                            real estate properties
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-muted-foreground">
                            All properties undergo due diligence and
                            verification processes
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-muted-foreground">
                            Investment minimums and maximums apply to each
                            tokenization
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-muted-foreground">
                            Tokens may generate dividend payments based on
                            rental income
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-purple-600" />
                        Platform Fees
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span className="text-muted-foreground">
                            Platform fee: 1% of investment amount
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span className="text-muted-foreground">
                            Management fee: Up to 2.5% annually of property
                            value
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span className="text-muted-foreground">
                            Transaction fees for blockchain operations
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span className="text-muted-foreground">
                            Fees are disclosed before any transaction
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="responsibilities">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    User Responsibilities
                  </h2>
                </div>
                <Card className="border-l-4 border-l-destructive">
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Prohibited Activities
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>
                            Using the platform for any illegal or unauthorized
                            purpose
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>
                            Attempting to manipulate token prices or market
                            conditions
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>
                            Providing false or misleading information during
                            registration
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>
                            Accessing another user's account without permission
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>
                            Reverse engineering or attempting to hack the
                            platform
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Compliance Requirements
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Users must comply with all applicable Nigerian laws and
                        regulations, including but not limited to securities
                        laws, anti-money laundering regulations, and tax
                        obligations.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="risk">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <span className="text-destructive font-bold">5</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Risk Disclosure
                  </h2>
                </div>
                <Card className="border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-foreground font-semibold">
                      Real estate investments carry significant risks including:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          Market volatility and potential loss of principal
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          Liquidity constraints - tokens may not be easily
                          tradeable
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          Property-specific risks (damage, vacancy, market
                          conditions)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          Regulatory changes affecting real estate or digital
                          assets
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          Technology risks related to blockchain infrastructure
                        </span>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground pt-4 border-t">
                      Detailed risk disclosures are available in our{" "}
                      <Link
                        to="/legal/risk-disclosure"
                        className="text-primary hover:underline"
                      >
                        Risk Disclosure Statement
                      </Link>
                      . Please read and understand these risks before investing.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="ip">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">6</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Intellectual Property
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      PropChain and its content, including but not limited to
                      text, graphics, logos, images, software, and data
                      compilations, are the property of PropChain or its
                      licensors and are protected by Nigerian and international
                      copyright laws.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Users are granted a limited, non-exclusive license to
                      access and use the platform for investment purposes only.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="liability">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">7</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Limitation of Liability
                  </h2>
                </div>
                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      PropChain provides the platform "as is" without warranties
                      of any kind. We do not guarantee the accuracy,
                      completeness, or timeliness of information provided on our
                      platform.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Our liability is limited to the maximum extent permitted
                      by Nigerian law. We shall not be liable for indirect,
                      incidental, special, or consequential damages.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Users acknowledge that cryptocurrency and blockchain
                      technologies involve inherent risks and we cannot be held
                      responsible for technical failures beyond our reasonable
                      control.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="dispute">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">8</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Dispute Resolution
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      Any disputes arising from the use of PropChain services
                      shall be resolved through binding arbitration in Lagos,
                      Nigeria, in accordance with the Arbitration and
                      Conciliation Act.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Before initiating formal dispute resolution, parties agree
                      to attempt good faith negotiations for a period of 30
                      days.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="termination">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">9</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Termination
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      PropChain reserves the right to suspend or terminate
                      accounts that violate these terms or engage in prohibited
                      activities. Users may close their accounts at any time,
                      subject to settlement of outstanding obligations.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Upon termination, users retain ownership of their tokens,
                      which remain on the blockchain, but lose access to
                      platform services.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="updates">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">10</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Updates and Changes
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      PropChain may update these Terms of Service from time to
                      time. Users will be notified of material changes via email
                      or platform notification.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Continued use of the platform after changes constitutes
                      acceptance of the updated terms.
                    </p>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Contact Information */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-6 w-6 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-muted-foreground">legal@propchain.ng</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Address
                    </p>
                    <p className="text-muted-foreground">Lagos, Nigeria</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Phone</p>
                    <p className="text-muted-foreground">+234 (0) 1 234 5678</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
