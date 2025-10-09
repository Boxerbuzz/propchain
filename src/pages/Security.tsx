import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, FileCheck, Building2, Database, Eye, CheckCircle2, AlertCircle, Users, Scale } from "lucide-react";
import { Link } from "react-router-dom";

export default function Security() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "SEC Regulated",
      description: "PropChain is registered and regulated by the Securities and Exchange Commission, Nigeria as a digital sub-broker, ensuring compliance with all Nigerian securities laws.",
      details: [
        "Full SEC registration and oversight",
        "Regular regulatory audits",
        "Compliance with securities regulations",
        "Licensed broker-dealer partnerships"
      ]
    },
    {
      icon: Lock,
      title: "Hedera Network Security",
      description: "Your property tokens are secured on the Hedera distributed ledger network, providing enterprise-grade security and immutability.",
      details: [
        "Hashgraph consensus algorithm",
        "Bank-grade security standards",
        "Immutable transaction records",
        "99.999% uptime guarantee"
      ]
    },
    {
      icon: Database,
      title: "Data Protection",
      description: "Your personal and financial data is protected using industry-leading encryption and security protocols.",
      details: [
        "256-bit SSL encryption",
        "Secure data storage",
        "GDPR-compliant practices",
        "Regular security audits"
      ]
    },
    {
      icon: FileCheck,
      title: "Legal Due Diligence",
      description: "Every property undergoes thorough legal verification before being listed on our platform.",
      details: [
        "Title verification",
        "Legal documentation review",
        "Property ownership confirmation",
        "Third-party legal audits"
      ]
    },
    {
      icon: Building2,
      title: "Asset Security",
      description: "Physical properties are secured through comprehensive insurance and professional property management.",
      details: [
        "Property insurance coverage",
        "Professional property management",
        "Regular maintenance and inspections",
        "24/7 security monitoring"
      ]
    },
    {
      icon: Users,
      title: "KYC & AML Compliance",
      description: "Robust identity verification and anti-money laundering procedures protect all investors.",
      details: [
        "Multi-level identity verification",
        "AML screening procedures",
        "Continuous monitoring",
        "Fraud prevention systems"
      ]
    }
  ];

  const investorProtections = [
    {
      title: "Regulatory Oversight",
      description: "All investments are subject to SEC Nigeria regulations and oversight, providing legal recourse and investor protection."
    },
    {
      title: "Transparent Operations",
      description: "Real-time access to property performance, financial reports, and transaction history through your dashboard."
    },
    {
      title: "Governance Rights",
      description: "Token holders can participate in major property decisions through our democratic governance system."
    },
    {
      title: "Dividend Protection",
      description: "Rental income and dividends are distributed automatically through smart contracts on the Hedera network."
    }
  ];

  const certifications = [
    { name: "SEC Nigeria", status: "Registered Digital Sub-Broker" },
    { name: "Hedera", status: "Network Partner" },
    { name: "Lambeth Capital", status: "Licensed Broker-Dealer Partner" },
    { name: "Paystack", status: "Payment Processing Partner" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">Security & Trust</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your Investment Security is Our Priority
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We employ multiple layers of security, from regulatory compliance to cutting-edge technology, ensuring your investments are protected at every level
            </p>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Security Measures</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                How we protect your investments, data, and assets
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hedera Technology */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge className="mb-4">Technology</Badge>
                    <h2 className="text-3xl font-bold mb-4">Why Hedera?</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      We chose Hedera for its enterprise-grade security, speed, and cost-effectiveness. Unlike traditional blockchains, Hedera uses the hashgraph consensus algorithm, providing superior performance and security.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold mb-1">aBFT Security</div>
                          <div className="text-sm text-muted-foreground">Asynchronous Byzantine Fault Tolerant - the gold standard in distributed ledger security</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold mb-1">10,000+ TPS</div>
                          <div className="text-sm text-muted-foreground">High transaction throughput for seamless property tokenization</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold mb-1">Low Fees</div>
                          <div className="text-sm text-muted-foreground">$0.0001 per transaction, making fractional ownership economically viable</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold mb-1">Energy Efficient</div>
                          <div className="text-sm text-muted-foreground">Carbon-negative network, aligned with sustainable investment practices</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-8 rounded-lg">
                    <h3 className="font-bold mb-4">Token Security Features</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Immutable ownership records</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Transparent transaction history</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Multi-signature security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Automated compliance rules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Real-time auditing capability</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investor Protections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Investor Protections</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Multiple layers of protection for your peace of mind
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {investorProtections.map((protection, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">{protection.title}</h3>
                        <p className="text-muted-foreground">{protection.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Certifications & Partnerships</h2>
              <p className="text-xl text-muted-foreground">
                Trusted partners and regulatory compliance
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {certifications.map((cert, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg mb-1">{cert.name}</div>
                        <div className="text-sm text-muted-foreground">{cert.status}</div>
                      </div>
                      <Scale className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Risk Disclosure */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-orange-500/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Important Risk Disclosure</h2>
                    <p className="text-muted-foreground">
                      PropChain is committed to transparency and investor education
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    While we implement comprehensive security measures, all investments carry inherent risks. The value of properties can fluctuate based on market conditions, and past performance does not guarantee future results.
                  </p>
                  <p>
                    PropChain does not provide investment advice. All investors should conduct their own due diligence and consider seeking independent financial advice before making investment decisions. You may receive back less than your original investment.
                  </p>
                  <p>
                    Real estate investments are subject to various risks including market volatility, property damage, tenant defaults, and regulatory changes. Investors should only invest amounts they can afford to lose.
                  </p>
                  <p>
                    For complete details, please review our <Link to="/legal/risk-disclosure" className="text-primary hover:underline">Risk Disclosure Statement</Link> and <Link to="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Have Security Questions?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our team is here to address any security concerns you may have
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/support">Contact Support</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
