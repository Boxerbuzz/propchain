import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, AlertTriangle, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
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
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Agreement Notice */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <AlertTriangle className="h-5 w-5" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                By accessing and using PropChain's services, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Service. If you do not agree 
                to these terms, please do not use our platform.
              </p>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Platform Overview</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  PropChain is a blockchain-based real estate investment platform operating in Nigeria. 
                  We facilitate the tokenization of real estate assets, allowing investors to purchase 
                  fractional ownership through digital tokens built on the Hedera Hashgraph network.
                </p>
                <p className="text-muted-foreground">
                  Our platform connects property owners seeking to tokenize their assets with investors 
                  looking for accessible real estate investment opportunities.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Eligibility and Account Registration</h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-medium text-foreground mb-3">Eligibility Requirements:</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Must be at least 18 years old</li>
                  <li>Must be a resident of Nigeria or eligible jurisdiction</li>
                  <li>Must complete our KYC (Know Your Customer) verification process</li>
                  <li>Must have the legal capacity to enter into binding agreements</li>
                  <li>Must not be on any sanctions or prohibited persons list</li>
                </ul>
                <h3 className="text-lg font-medium text-foreground mb-3">Account Security:</h3>
                <p className="text-muted-foreground mb-2">
                  You are responsible for maintaining the security of your account credentials, 
                  including your password and any wallet private keys.
                </p>
                <p className="text-muted-foreground">
                  Notify us immediately of any unauthorized access or security breaches.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Investment Services</h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-medium text-foreground mb-3">Tokenized Real Estate:</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Tokens represent fractional ownership in specific real estate properties</li>
                  <li>All properties undergo due diligence and verification processes</li>
                  <li>Investment minimums and maximums apply to each tokenization</li>
                  <li>Tokens may generate dividend payments based on rental income</li>
                </ul>
                <h3 className="text-lg font-medium text-foreground mb-3">Platform Fees:</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Platform fee: 1% of investment amount</li>
                  <li>Management fee: Up to 2.5% annually of property value</li>
                  <li>Transaction fees for blockchain operations</li>
                  <li>Fees are disclosed before any transaction</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. User Responsibilities</h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-medium text-foreground mb-3">Prohibited Activities:</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>Using the platform for any illegal or unauthorized purpose</li>
                  <li>Attempting to manipulate token prices or market conditions</li>
                  <li>Providing false or misleading information during registration</li>
                  <li>Accessing another user's account without permission</li>
                  <li>Reverse engineering or attempting to hack the platform</li>
                </ul>
                <h3 className="text-lg font-medium text-foreground mb-3">Compliance:</h3>
                <p className="text-muted-foreground">
                  Users must comply with all applicable Nigerian laws and regulations, 
                  including but not limited to securities laws, anti-money laundering 
                  regulations, and tax obligations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Risk Disclosure</h2>
              <div className="prose prose-gray max-w-none">
                <Card className="border-destructive/20 bg-destructive/5 mb-4">
                  <CardContent className="pt-6">
                    <p className="text-foreground font-medium mb-2">
                      Real estate investments carry significant risks including:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Market volatility and potential loss of principal</li>
                      <li>Liquidity constraints - tokens may not be easily tradeable</li>
                      <li>Property-specific risks (damage, vacancy, market conditions)</li>
                      <li>Regulatory changes affecting real estate or digital assets</li>
                      <li>Technology risks related to blockchain infrastructure</li>
                    </ul>
                  </CardContent>
                </Card>
                <p className="text-muted-foreground">
                  Detailed risk disclosures are available in our Risk Disclosure Statement. 
                  Please read and understand these risks before investing.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  PropChain and its content, including but not limited to text, graphics, logos, 
                  images, software, and data compilations, are the property of PropChain or its 
                  licensors and are protected by Nigerian and international copyright laws.
                </p>
                <p className="text-muted-foreground">
                  Users are granted a limited, non-exclusive license to access and use the platform 
                  for investment purposes only.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  PropChain provides the platform "as is" without warranties of any kind. 
                  We do not guarantee the accuracy, completeness, or timeliness of information 
                  provided on our platform.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our liability is limited to the maximum extent permitted by Nigerian law. 
                  We shall not be liable for indirect, incidental, special, or consequential damages.
                </p>
                <p className="text-muted-foreground">
                  Users acknowledge that cryptocurrency and blockchain technologies involve 
                  inherent risks and we cannot be held responsible for technical failures 
                  beyond our reasonable control.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Dispute Resolution</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  Any disputes arising from the use of PropChain services shall be resolved 
                  through binding arbitration in Lagos, Nigeria, in accordance with the 
                  Arbitration and Conciliation Act.
                </p>
                <p className="text-muted-foreground">
                  Before initiating formal dispute resolution, parties agree to attempt 
                  good faith negotiations for a period of 30 days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Termination</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  PropChain reserves the right to suspend or terminate accounts that violate 
                  these terms or engage in prohibited activities. Users may close their accounts 
                  at any time, subject to settlement of outstanding obligations.
                </p>
                <p className="text-muted-foreground">
                  Upon termination, users retain ownership of their tokens, which remain 
                  on the blockchain, but lose access to platform services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. Updates and Changes</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  PropChain may update these Terms of Service from time to time. 
                  Users will be notified of material changes via email or platform notification.
                </p>
                <p className="text-muted-foreground">
                  Continued use of the platform after changes constitutes acceptance 
                  of the updated terms.
                </p>
              </div>
            </section>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: legal@propchain.ng</p>
                <p>Address: Lagos, Nigeria</p>
                <p>Phone: +234 (0) 1 234 5678</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}