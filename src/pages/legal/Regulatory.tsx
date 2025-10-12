import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Scale,
  Shield,
  FileCheck,
  Building2,
  Globe,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Regulatory() {
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
    { id: "framework", title: "Nigerian Framework" },
    { id: "international", title: "International Standards" },
    { id: "structure", title: "Investment Structure" },
    { id: "investors", title: "Investor Classifications" },
    { id: "monitoring", title: "Regulatory Monitoring" },
    { id: "dispute", title: "Dispute Resolution" },
    { id: "tax", title: "Tax Implications" },
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mx-auto mb-6">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <Badge className="mb-6 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 text-sm px-5 py-2" variant="outline">
              <Sparkles className="w-3 h-3 mr-2" />
              Compliance and Legal Framework
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Regulatory Information
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge variant="secondary" className="px-4 py-1.5">
                Last updated: January 2025
              </Badge>
              <span className="text-muted-foreground">14 min read</span>
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
            {/* Regulatory Status */}
            <Card className="border-2 border-blue-600/20 bg-gradient-to-br from-blue-600/5 to-blue-600/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xl">
                  <Shield className="h-6 w-6" />
                  Regulatory Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="font-medium text-foreground">
                      Nigerian Securities & Exchange Commission (SEC)
                    </span>
                    <Badge className="bg-yellow-500 text-white">
                      Monitoring Compliance
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="font-medium text-foreground">
                      Central Bank of Nigeria (CBN) Guidelines
                    </span>
                    <Badge className="bg-green-600 text-white">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="font-medium text-foreground">
                      Financial Intelligence Unit (NFIU) AML/CFT
                    </span>
                    <Badge className="bg-green-600 text-white">Compliant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                    PropChain operates under Nigerian law and maintains
                    compliance with all applicable financial services
                    regulations. We continuously monitor regulatory developments
                    and adapt our operations accordingly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory Sections */}
            <div className="space-y-12">
              <section id="framework">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Nigerian Regulatory Framework
                  </h2>
                </div>

                <div className="space-y-6">
                  <Card className="border-2 border-blue-300 dark:border-blue-800 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        Securities and Exchange Commission (SEC)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">
                          Applicable Regulations:
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>
                              Investment and Securities Act (ISA) 2007
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>
                              SEC Rules on Crowdfunding and Digital Assets
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Guidelines for Digital Asset Offerings</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Capital Market Master Plan IV (CMP IV)</span>
                          </li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-foreground mb-3">
                          Compliance Measures:
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Registration as a Capital Market Operator (pending
                              approval)
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Compliance with investor protection requirements
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Regular reporting to SEC on platform activities
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Adherence to disclosure and transparency standards
                            </span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-300 dark:border-green-800 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Central Bank of Nigeria (CBN)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">
                          Relevant Guidelines:
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>Payment Service Bank (PSB) Guidelines</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>
                              Anti-Money Laundering/Combating the Financing of
                              Terrorism (AML/CFT) Regulations
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>Know Your Customer (KYC) Requirements</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>Consumer Protection Framework</span>
                          </li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-foreground mb-3">
                          Our Compliance:
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Robust KYC and customer onboarding procedures
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Transaction monitoring and suspicious activity
                              reporting
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Consumer protection and fair treatment policies
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>Data protection and privacy compliance</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-300 dark:border-purple-800 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        Nigerian Financial Intelligence Unit (NFIU)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <h4 className="font-semibold text-foreground mb-3">
                        AML/CFT Compliance:
                      </h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 mt-1 shrink-0" />
                          <span>Customer Due Diligence (CDD) procedures</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 mt-1 shrink-0" />
                          <span>
                            Enhanced Due Diligence (EDD) for high-risk customers
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 mt-1 shrink-0" />
                          <span>
                            Politically Exposed Persons (PEP) screening
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 mt-1 shrink-0" />
                          <span>
                            Suspicious Transaction Report (STR) filing
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 mt-1 shrink-0" />
                          <span>
                            Currency Transaction Report (CTR) compliance
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="international">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    International Standards and Best Practices
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950 dark:to-indigo-900/50 border-indigo-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">FATF Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span>Risk-based approach to AML/CFT</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span>
                            Virtual Asset Service Provider (VASP)
                            recommendations
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span>
                            Travel Rule compliance for crypto transactions
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span>Beneficial ownership identification</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950 dark:to-teal-900/50 border-teal-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Data Protection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 mt-1">•</span>
                          <span>
                            Nigerian Data Protection Regulation (NDPR)
                            compliance
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 mt-1">•</span>
                          <span>GDPR principles where applicable</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 mt-1">•</span>
                          <span>Cross-border data transfer safeguards</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 mt-1">•</span>
                          <span>Privacy by design implementation</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="structure">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground font-bold">3</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Investment Structure and Legal Framework
                  </h2>
                </div>
                <div className="space-y-6">
                  <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        Tokenization Legal Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">
                          Property Ownership Structure:
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>
                              Properties are held through Nigerian incorporated
                              Special Purpose Vehicles (SPVs)
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>
                              SPVs hold legal title to the underlying real
                              estate assets
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>
                              Tokens represent beneficial interests in the SPV
                              and underlying property
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>
                              Corporate governance ensures proper management and
                              oversight
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-foreground mb-3">
                          Token Legal Status:
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Tokens are structured as security tokens under
                              Nigerian law
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>
                              Comply with applicable securities regulations
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>Subject to investor protection measures</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                            <span>Clear rights and obligations documented</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Property Due Diligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-foreground mb-3">
                        Legal Due Diligence Process:
                      </h4>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1 font-bold">
                            →
                          </span>
                          <div>
                            <span className="font-semibold">
                              Title Verification:
                            </span>
                            <span className="ml-1">
                              Certificate of Occupancy (C of O) verification
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1 font-bold">
                            →
                          </span>
                          <div>
                            <span className="font-semibold">Legal Search:</span>
                            <span className="ml-1">
                              State lands registry search and title confirmation
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1 font-bold">
                            →
                          </span>
                          <div>
                            <span className="font-semibold">
                              Encumbrance Check:
                            </span>
                            <span className="ml-1">
                              Verification of liens, mortgages, or other claims
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1 font-bold">
                            →
                          </span>
                          <div>
                            <span className="font-semibold">
                              Zoning Compliance:
                            </span>
                            <span className="ml-1">
                              Confirmation of proper zoning and permits
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1 font-bold">
                            →
                          </span>
                          <div>
                            <span className="font-semibold">Valuation:</span>
                            <span className="ml-1">
                              Independent professional property valuation
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1 font-bold">
                            →
                          </span>
                          <div>
                            <span className="font-semibold">Insurance:</span>
                            <span className="ml-1">
                              Comprehensive property insurance coverage
                            </span>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="investors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground font-bold">4</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Investor Classifications and Limits
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-2 border-blue-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Retail Investors
                        </CardTitle>
                        <Badge className="bg-blue-600 text-white">
                          Standard Tier
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>
                            Maximum investment: ₦10,000,000 per property
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>Annual investment limit: ₦50,000,000</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>Standard KYC requirements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>Basic investor education required</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>Cooling-off period: 48 hours</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-2 border-green-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Sophisticated Investors
                        </CardTitle>
                        <Badge className="bg-green-600 text-white">
                          Premium Tier
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Higher investment limits available</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Enhanced due diligence requirements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Minimum net worth: ₦100,000,000</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Professional investment experience</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Access to exclusive opportunities</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="monitoring">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground font-bold">5</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Regulatory Monitoring and Reporting
                  </h2>
                </div>
                <Card className="border-0 shadow-md bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Regular Reporting Requirements
                      </h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Monthly transaction reports to relevant authorities
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Quarterly compliance certification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Annual audited financial statements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Suspicious activity reports as required</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Regulatory correspondence and communications
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        Ongoing Monitoring
                      </h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Real-time transaction monitoring systems</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Regular compliance reviews and updates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>External compliance audits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Regulatory change monitoring and implementation
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="dispute">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground font-bold">6</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Dispute Resolution Framework
                  </h2>
                </div>
                <Card className="border-0 shadow-md bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">
                        Multi-Tier Resolution Process:
                      </h4>
                      <ol className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-3">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                            1
                          </span>
                          <div>
                            <span className="font-semibold">
                              Internal Resolution:
                            </span>
                            <span className="ml-1">
                              Customer service and internal dispute resolution
                              (7-14 days)
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                            2
                          </span>
                          <div>
                            <span className="font-semibold">
                              Alternative Dispute Resolution:
                            </span>
                            <span className="ml-1">
                              Mediation through Lagos Multi-Door Courthouse
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                            3
                          </span>
                          <div>
                            <span className="font-semibold">
                              Regulatory Escalation:
                            </span>
                            <span className="ml-1">
                              Complaints to SEC or other relevant regulators
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                            4
                          </span>
                          <div>
                            <span className="font-semibold">Arbitration:</span>
                            <span className="ml-1">
                              Binding arbitration under Nigerian Arbitration and
                              Conciliation Act
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">
                            5
                          </span>
                          <div>
                            <span className="font-semibold">
                              Court Proceedings:
                            </span>
                            <span className="ml-1">
                              Nigerian courts as final resort
                            </span>
                          </div>
                        </li>
                      </ol>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-foreground mb-3">
                        Investor Protection Measures:
                      </h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                          <span>Professional indemnity insurance coverage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                          <span>Client money segregation and protection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                          <span>Independent custody arrangements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                          <span>Regular third-party audits</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="tax">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <span className="text-amber-600 font-bold">7</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Tax Implications and Guidance
                  </h2>
                </div>
                <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-amber-800 dark:text-amber-400 font-semibold text-lg">
                        Important Tax Notice: This information is for general
                        guidance only. Consult qualified tax advisors for
                        specific tax advice.
                      </p>
                      <div className="pt-4 border-t border-amber-500/20">
                        <h4 className="font-semibold text-foreground mb-3">
                          Potential Tax Considerations:
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>Capital gains tax on token appreciation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>Income tax on dividend distributions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>Stamp duty on property transactions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>Value Added Tax (VAT) implications</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>Withholding tax on investment returns</span>
                          </li>
                        </ul>
                      </div>
                      <p className="text-muted-foreground text-sm pt-4 border-t border-amber-500/20">
                        Tax treatment of digital assets and real estate tokens
                        continues to evolve. PropChain provides annual tax
                        reporting documents but does not provide tax advice.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Contact Information */}
            <Card className="border-0 shadow-md bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-white" />
                  </div>
                  Regulatory Compliance Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-foreground mb-4">
                  For regulatory inquiries, compliance matters, or legal
                  questions:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Compliance Officer
                    </p>
                    <p className="text-muted-foreground">
                      compliance@propchain.ng
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Legal Department
                    </p>
                    <p className="text-muted-foreground">legal@propchain.ng</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Regulatory Affairs
                    </p>
                    <p className="text-muted-foreground">
                      regulatory@propchain.ng
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Address
                    </p>
                    <p className="text-muted-foreground">
                      PropChain Regulatory Office, Lagos, Nigeria
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Disclaimer:</strong> This information is current as
                    of the date shown above. Regulatory requirements may change,
                    and this document will be updated accordingly. This document
                    does not constitute legal advice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
