import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function PrivacyPolicy() {
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
    { id: "collection", title: "Information We Collect" },
    { id: "usage", title: "How We Use Information" },
    { id: "sharing", title: "Information Sharing" },
    { id: "security", title: "Data Security" },
    { id: "rights", title: "Your Privacy Rights" },
    { id: "transfers", title: "International Transfers" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "children", title: "Children's Privacy" },
    { id: "policy-updates", title: "Policy Updates" },
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Privacy Policy
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-3 py-1 bg-green-600/10 text-green-600 rounded-full font-medium">
                  Last updated: January 2025
                </span>
                <span className="text-muted-foreground">12 min read</span>
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
            {/* Privacy Commitment */}
            <Card className="border-2 border-green-600/20 bg-gradient-to-br from-green-600/5 to-green-600/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-xl">
                  <Lock className="h-6 w-6" />
                  Our Privacy Commitment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  PropChain is committed to protecting your privacy and personal
                  information. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our real
                  estate tokenization platform.
                </p>
              </CardContent>
            </Card>

            {/* Privacy Sections */}
            <div className="space-y-12">
              <section id="collection">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Information We Collect
                  </h2>
                </div>

                <div className="space-y-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                          <span className="text-muted-foreground">
                            <strong>Identity Information:</strong> Full name,
                            date of birth, nationality, government-issued ID
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                          <span className="text-muted-foreground">
                            <strong>Contact Information:</strong> Email address,
                            phone number, residential address
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                          <span className="text-muted-foreground">
                            <strong>Financial Information:</strong> Bank account
                            details, income information, investment history
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                          <span className="text-muted-foreground">
                            <strong>KYC Documentation:</strong> Identity
                            verification documents, proof of address, selfie
                            verification
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-purple-600" />
                        Technical Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>
                            IP address, browser type, operating system
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>
                            Device identifiers and mobile device information
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>
                            Blockchain wallet addresses and transaction hashes
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>
                            Platform usage data and interaction patterns
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>Cookies and similar tracking technologies</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-green-600" />
                        Investment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Investment preferences and risk tolerance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>
                            Transaction history and portfolio holdings
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Communications with our support team</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Property preferences and search history</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="usage">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    How We Use Your Information
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Service Provision
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Create and manage your account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Process investment transactions and token transfers
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Verify your identity and comply with KYC
                            requirements
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Provide customer support and respond to inquiries
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Send important account and transaction notifications
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Legal and Regulatory Compliance
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Comply with anti-money laundering (AML) regulations
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Meet Know Your Customer (KYC) requirements
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Report to regulatory authorities as required
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Prevent fraud, money laundering, and other illegal
                            activities
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Enforce our Terms of Service</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Platform Improvement
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Analyze platform usage to improve our services
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>
                            Develop new features and investment products
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Personalize your platform experience</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Conduct research and analytics</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="sharing">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <span className="text-amber-600 font-bold">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Information Sharing and Disclosure
                  </h2>
                </div>

                <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10 mb-4">
                  <CardContent className="pt-6">
                    <p className="text-foreground font-semibold mb-2">
                      We do not sell, rent, or trade your personal information
                      to third parties for marketing purposes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      We may share information with:
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Service Providers:</strong> Third-party
                          vendors who help us operate the platform (payment
                          processors, KYC providers, etc.)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Regulatory Authorities:</strong> Government
                          agencies and regulators as required by law
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Legal Proceedings:</strong> Courts, law
                          enforcement, and legal representatives when compelled
                          by law
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Business Transfers:</strong> In case of
                          merger, acquisition, or sale of assets
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Consent:</strong> Other parties when you
                          explicitly consent to the disclosure
                        </span>
                      </li>
                    </ul>
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Blockchain Information
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Please note that blockchain transactions are public by
                        nature. While wallet addresses may not directly identify
                        you, transaction information on the Hedera network is
                        permanently recorded and publicly accessible.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="security">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Data Security
                  </h2>
                </div>
                <Card className="border-l-4 border-l-green-600">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      We implement robust security measures to protect your
                      personal information:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <span>
                          Encryption of data in transit and at rest using
                          industry-standard protocols
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <span>
                          Multi-factor authentication for account access
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <span>
                          Regular security audits and penetration testing
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <span>
                          Secure data centers with physical access controls
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <span>
                          Employee training on data protection and privacy
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <span>
                          Incident response procedures for security breaches
                        </span>
                      </li>
                    </ul>
                    <Card className="border-destructive/20 bg-destructive/5 mt-4">
                      <CardContent className="pt-6">
                        <p className="text-foreground text-sm">
                          <strong>Important:</strong> While we implement strong
                          security measures, no system is 100% secure. Please
                          use strong passwords and enable two-factor
                          authentication on your account.
                        </p>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </section>

              <section id="rights">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">5</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Privacy Rights
                  </h2>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    You have the following rights regarding your personal
                    information:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Access Rights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            <span>Request a copy of your personal data</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            <span>
                              Information about how we process your data
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            <span>
                              Details about data sharing and transfers
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50 border-purple-200">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Control Rights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                            <span>Correct inaccurate information</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                            <span>Update your preferences</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                            <span>Opt-out of marketing communications</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Data Retention
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We retain your personal information for as long as
                        necessary to provide our services and comply with legal
                        obligations. KYC information may be retained for up to 7
                        years after account closure as required by Nigerian law.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="transfers">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">6</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    International Transfers
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      Your information may be processed and stored in countries
                      outside Nigeria where our service providers are located.
                      We ensure appropriate safeguards are in place to protect
                      your information during international transfers.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      We comply with applicable data protection laws and
                      implement contractual protections to maintain the security
                      and privacy of your data.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="cookies">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">7</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Cookies and Tracking
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      We use cookies and similar technologies to:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Remember your preferences and settings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          Authenticate your identity and maintain sessions
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Analyze platform usage and performance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          Provide personalized content and recommendations
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Prevent fraud and enhance security</span>
                      </li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed text-sm pt-2">
                      You can control cookie settings through your browser
                      preferences. Note that disabling certain cookies may
                      affect platform functionality.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="third-party">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">8</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Third-Party Services
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      Our platform may contain links to third-party websites or
                      integrate with third-party services (payment processors,
                      analytics providers, etc.). This privacy policy does not
                      cover these external services.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      We encourage you to review the privacy policies of any
                      third-party services you interact with through our
                      platform.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="children">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">9</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Children's Privacy
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      PropChain services are not intended for individuals under
                      18 years of age. We do not knowingly collect personal
                      information from children. If we discover that we have
                      collected information from a child, we will promptly
                      delete it.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="policy-updates">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">10</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Policy Updates
                  </h2>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      We may update this Privacy Policy periodically to reflect
                      changes in our practices, technology, or legal
                      requirements. We will notify users of material changes via
                      email or platform notification.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      We encourage you to review this policy regularly to stay
                      informed about how we protect your information.
                    </p>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Contact Information */}
            <Card className="border-2 border-green-600/20 bg-gradient-to-br from-green-600/5 to-green-600/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Eye className="h-6 w-6 text-green-600" />
                  Privacy Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">
                  For questions about this Privacy Policy or to exercise your
                  privacy rights:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Privacy Officer
                    </p>
                    <p className="text-muted-foreground">
                      privacy@propchain.ng
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Data Protection Queries
                    </p>
                    <p className="text-muted-foreground">dpo@propchain.ng</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      General Support
                    </p>
                    <p className="text-muted-foreground">
                      support@propchain.ng
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Address
                    </p>
                    <p className="text-muted-foreground">
                      PropChain Privacy Office, Lagos, Nigeria
                    </p>
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
