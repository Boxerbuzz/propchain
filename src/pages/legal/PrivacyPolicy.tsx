import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Privacy Commitment */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Lock className="h-5 w-5" />
                Our Privacy Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                PropChain is committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our real estate tokenization platform.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Personal Information
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Identity Information:</strong> Full name, date of birth, nationality, government-issued ID</li>
                    <li><strong>Contact Information:</strong> Email address, phone number, residential address</li>
                    <li><strong>Financial Information:</strong> Bank account details, income information, investment history</li>
                    <li><strong>KYC Documentation:</strong> Identity verification documents, proof of address, selfie verification</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Technical Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>IP address, browser type, operating system</li>
                    <li>Device identifiers and mobile device information</li>
                    <li>Blockchain wallet addresses and transaction hashes</li>
                    <li>Platform usage data and interaction patterns</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Investment Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Investment preferences and risk tolerance</li>
                    <li>Transaction history and portfolio holdings</li>
                    <li>Communications with our support team</li>
                    <li>Property preferences and search history</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Service Provision</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Create and manage your account</li>
                    <li>Process investment transactions and token transfers</li>
                    <li>Verify your identity and comply with KYC requirements</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Send important account and transaction notifications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Legal and Regulatory Compliance</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Comply with anti-money laundering (AML) regulations</li>
                    <li>Meet Know Your Customer (KYC) requirements</li>
                    <li>Report to regulatory authorities as required</li>
                    <li>Prevent fraud, money laundering, and other illegal activities</li>
                    <li>Enforce our Terms of Service</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Platform Improvement</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Analyze platform usage to improve our services</li>
                    <li>Develop new features and investment products</li>
                    <li>Personalize your platform experience</li>
                    <li>Conduct research and analytics</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Information Sharing and Disclosure</h2>
              <div className="space-y-4">
                <Card className="border-warning/20 bg-warning/5">
                  <CardContent className="pt-6">
                    <p className="text-foreground font-medium mb-2">
                      We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                    </p>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">We may share information with:</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Service Providers:</strong> Third-party vendors who help us operate the platform (payment processors, KYC providers, etc.)</li>
                    <li><strong>Regulatory Authorities:</strong> Government agencies and regulators as required by law</li>
                    <li><strong>Legal Proceedings:</strong> Courts, law enforcement, and legal representatives when compelled by law</li>
                    <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                    <li><strong>Consent:</strong> Other parties when you explicitly consent to the disclosure</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Blockchain Information</h3>
                  <p className="text-muted-foreground">
                    Please note that blockchain transactions are public by nature. While wallet addresses 
                    may not directly identify you, transaction information on the Hedera network is 
                    permanently recorded and publicly accessible.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Security</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We implement robust security measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Encryption of data in transit and at rest using industry-standard protocols</li>
                  <li>Multi-factor authentication for account access</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Secure data centers with physical access controls</li>
                  <li>Employee training on data protection and privacy</li>
                  <li>Incident response procedures for security breaches</li>
                </ul>
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="pt-6">
                    <p className="text-foreground">
                      <strong>Important:</strong> While we implement strong security measures, 
                      no system is 100% secure. Please use strong passwords and enable 
                      two-factor authentication on your account.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Your Privacy Rights</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Access Rights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                        <li>Request a copy of your personal data</li>
                        <li>Information about how we process your data</li>
                        <li>Details about data sharing and transfers</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Control Rights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                        <li>Correct inaccurate information</li>
                        <li>Update your preferences</li>
                        <li>Opt-out of marketing communications</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Data Retention</h3>
                  <p className="text-muted-foreground">
                    We retain your personal information for as long as necessary to provide 
                    our services and comply with legal obligations. KYC information may be 
                    retained for up to 7 years after account closure as required by Nigerian law.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. International Transfers</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  Your information may be processed and stored in countries outside Nigeria 
                  where our service providers are located. We ensure appropriate safeguards 
                  are in place to protect your information during international transfers.
                </p>
                <p className="text-muted-foreground">
                  We comply with applicable data protection laws and implement contractual 
                  protections to maintain the security and privacy of your data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Cookies and Tracking</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your identity and maintain sessions</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Prevent fraud and enhance security</li>
                </ul>
                <p className="text-muted-foreground">
                  You can control cookie settings through your browser preferences. 
                  Note that disabling certain cookies may affect platform functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Third-Party Services</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  Our platform may contain links to third-party websites or integrate with 
                  third-party services (payment processors, analytics providers, etc.). 
                  This privacy policy does not cover these external services.
                </p>
                <p className="text-muted-foreground">
                  We encourage you to review the privacy policies of any third-party 
                  services you interact with through our platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground">
                  PropChain services are not intended for individuals under 18 years of age. 
                  We do not knowingly collect personal information from children. If we discover 
                  that we have collected information from a child, we will promptly delete it.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. Policy Updates</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-4">
                  We may update this Privacy Policy periodically to reflect changes in 
                  our practices, technology, or legal requirements. We will notify users 
                  of material changes via email or platform notification.
                </p>
                <p className="text-muted-foreground">
                  We encourage you to review this policy regularly to stay informed 
                  about how we protect your information.
                </p>
              </div>
            </section>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Privacy Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For questions about this Privacy Policy or to exercise your privacy rights:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Privacy Officer:</strong> privacy@propchain.ng</p>
                <p><strong>Data Protection Queries:</strong> dpo@propchain.ng</p>
                <p><strong>General Support:</strong> support@propchain.ng</p>
                <p><strong>Address:</strong> PropChain Privacy Office, Lagos, Nigeria</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}