import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, TrendingDown, Building, Zap, Globe, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto mobile-padding py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Risk Disclosure Statement</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Critical Warning */}
          <Card className="border-destructive border-2 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                IMPORTANT RISK WARNING
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground font-semibold">
                REAL ESTATE TOKENIZATION INVOLVES SIGNIFICANT FINANCIAL RISKS
              </p>
              <div className="bg-background border border-destructive/20 rounded-lg p-4">
                <ul className="space-y-2 text-foreground">
                  <li>• <strong>You may lose some or all of your invested capital</strong></li>
                  <li>• <strong>Tokens may have limited or no liquidity</strong></li>
                  <li>• <strong>Property values can decrease significantly</strong></li>
                  <li>• <strong>Dividend payments are not guaranteed</strong></li>
                  <li>• <strong>Technology and regulatory risks apply</strong></li>
                </ul>
              </div>
              <p className="text-muted-foreground">
                Only invest money you can afford to lose. Seek independent financial advice 
                if you are unsure about the suitability of this investment.
              </p>
            </CardContent>
          </Card>

          {/* Risk Categories */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                Real Estate Investment Risks
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      Market Risk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="destructive" className="mb-2">High Risk</Badge>
                    <ul className="list-disc pl-6 space-y-2 text-orange-700 text-sm">
                      <li>Property values may decline due to market conditions</li>
                      <li>Economic downturns can severely impact real estate prices</li>
                      <li>Interest rate changes affect property valuations</li>
                      <li>Local market factors may negatively impact specific properties</li>
                      <li>Supply and demand imbalances in the real estate market</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Property-Specific Risk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary" className="mb-2">Medium-High Risk</Badge>
                    <ul className="list-disc pl-6 space-y-2 text-amber-700 text-sm">
                      <li>Structural damage, natural disasters, or force majeure events</li>
                      <li>Tenant vacancies resulting in reduced rental income</li>
                      <li>Maintenance and repair costs exceeding expectations</li>
                      <li>Zoning changes or regulatory restrictions</li>
                      <li>Environmental liabilities or contamination issues</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-800">Liquidity Risk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="destructive" className="mb-2">Very High Risk</Badge>
                    <ul className="list-disc pl-6 space-y-2 text-red-700 text-sm">
                      <li>Tokens may not be easily tradeable or sellable</li>
                      <li>Limited secondary market for real estate tokens</li>
                      <li>Long holding periods may be required</li>
                      <li>Emergency liquidation may not be possible</li>
                      <li>Price discovery mechanisms may be inefficient</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-800">Income Risk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge className="bg-yellow-200 text-yellow-800 mb-2">Medium Risk</Badge>
                    <ul className="list-disc pl-6 space-y-2 text-yellow-700 text-sm">
                      <li>Rental income may be irregular or cease entirely</li>
                      <li>Dividend payments are not guaranteed</li>
                      <li>Operating expenses may exceed rental income</li>
                      <li>Property management issues affecting returns</li>
                      <li>Currency fluctuation risks for international investors</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Technology and Blockchain Risks
              </h2>
              
              <div className="space-y-6">
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-800">Blockchain Technology Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2 text-purple-700">
                      <li><strong>Smart Contract Vulnerabilities:</strong> Bugs or exploits in smart contracts could result in loss of funds</li>
                      <li><strong>Network Risks:</strong> Hedera network downtime, congestion, or technical failures</li>
                      <li><strong>Key Management:</strong> Loss of private keys results in permanent loss of token access</li>
                      <li><strong>Protocol Changes:</strong> Updates to the Hedera protocol may affect token functionality</li>
                      <li><strong>Cybersecurity:</strong> Hacking attempts on wallets, exchanges, or platform infrastructure</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-indigo-200 bg-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-indigo-800">Platform and Operational Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2 text-indigo-700">
                      <li><strong>Platform Failure:</strong> Technical issues or business failure of PropChain</li>
                      <li><strong>Custody Risk:</strong> Risks associated with token custody and wallet security</li>
                      <li><strong>Operational Errors:</strong> Human errors in platform operations or property management</li>
                      <li><strong>Third-Party Dependencies:</strong> Reliance on external service providers and integrations</li>
                      <li><strong>Data Breaches:</strong> Unauthorized access to personal or financial information</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                Regulatory and Legal Risks
              </h2>
              
              <div className="space-y-6">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">Regulatory Uncertainty</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2 text-green-700">
                      <li><strong>Changing Regulations:</strong> New laws may restrict or prohibit tokenized real estate</li>
                      <li><strong>Compliance Costs:</strong> Regulatory compliance may increase operational costs</li>
                      <li><strong>Legal Classification:</strong> Uncertainty about legal status of real estate tokens</li>
                      <li><strong>Cross-Border Issues:</strong> International regulatory conflicts and restrictions</li>
                      <li><strong>Tax Implications:</strong> Unclear or changing tax treatment of token investments</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">Legal and Contractual Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2 text-blue-700">
                      <li><strong>Property Rights:</strong> Disputes over underlying property ownership or title</li>
                      <li><strong>Legal Enforceability:</strong> Challenges in enforcing token holder rights</li>
                      <li><strong>Jurisdiction Issues:</strong> Unclear legal jurisdiction for dispute resolution</li>
                      <li><strong>Corporate Structure:</strong> Risks related to the legal structure of tokenized properties</li>
                      <li><strong>Documentation Risk:</strong> Inadequate or unclear legal documentation</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Nigerian Market Specific Risks</h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Currency Risk:</strong> Nigerian Naira volatility affecting property values and returns</li>
                    <li><strong>Political Risk:</strong> Changes in government policies affecting real estate or blockchain</li>
                    <li><strong>Economic Instability:</strong> Inflation, recession, or economic crises impact</li>
                    <li><strong>Infrastructure Risk:</strong> Power, internet, or other infrastructure limitations</li>
                    <li><strong>Legal System:</strong> Challenges with property registration and legal enforcement</li>
                    <li><strong>Market Development:</strong> Relatively nascent real estate tokenization market</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Risk Mitigation Measures</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      PropChain's Risk Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                      <li>Due diligence on all properties before tokenization</li>
                      <li>Professional property valuations and regular updates</li>
                      <li>Insurance coverage for physical property risks</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Compliance with regulatory requirements</li>
                      <li>Diversification across multiple properties and markets</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">Investor Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                      <li>Only invest amounts you can afford to lose entirely</li>
                      <li>Diversify across multiple properties and asset classes</li>
                      <li>Understand the technology and risks before investing</li>
                      <li>Keep secure backups of wallet keys and credentials</li>
                      <li>Monitor your investments regularly</li>
                      <li>Seek professional financial advice when needed</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Acknowledgment</h2>
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-foreground font-medium">
                      By using PropChain's services, you acknowledge that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>You have read and understood all risks outlined in this disclosure</li>
                      <li>You understand that past performance does not guarantee future results</li>
                      <li>You accept full responsibility for your investment decisions</li>
                      <li>You have the financial capacity to bear potential losses</li>
                      <li>You will not rely solely on PropChain for investment advice</li>
                      <li>You understand the speculative nature of real estate tokenization</li>
                    </ul>
                    <div className="bg-background border border-destructive/20 rounded-lg p-4 mt-4">
                      <p className="text-foreground font-semibold text-center">
                        THIS INVESTMENT IS SUITABLE ONLY FOR SOPHISTICATED INVESTORS 
                        WHO FULLY UNDERSTAND THE RISKS INVOLVED
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Questions About Risks?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions about these risks or need clarification:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: risk@propchain.ng</p>
                <p>Investment Support: support@propchain.ng</p>
                <p>Regulatory Queries: compliance@propchain.ng</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                This risk disclosure statement does not constitute investment advice. 
                Always consult with qualified financial advisors before making investment decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}