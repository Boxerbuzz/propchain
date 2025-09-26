import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Scale, Shield, FileCheck, Building2, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function Regulatory() {
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
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Regulatory Information</h1>
              <p className="text-muted-foreground">Compliance and Legal Framework</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Regulatory Status */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Shield className="h-5 w-5" />
                Regulatory Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Nigerian Securities & Exchange Commission (SEC)</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Monitoring Compliance</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Central Bank of Nigeria (CBN) Guidelines</span>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Financial Intelligence Unit (NFIU) AML/CFT</span>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  PropChain operates under Nigerian law and maintains compliance with all 
                  applicable financial services regulations. We continuously monitor regulatory 
                  developments and adapt our operations accordingly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Regulatory Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Nigerian Regulatory Framework
              </h2>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Securities and Exchange Commission (SEC)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Applicable Regulations:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Investment and Securities Act (ISA) 2007</li>
                        <li>SEC Rules on Crowdfunding and Digital Assets</li>
                        <li>Guidelines for Digital Asset Offerings</li>
                        <li>Capital Market Master Plan IV (CMP IV)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Compliance Measures:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Registration as a Capital Market Operator (pending approval)</li>
                        <li>Compliance with investor protection requirements</li>
                        <li>Regular reporting to SEC on platform activities</li>
                        <li>Adherence to disclosure and transparency standards</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Central Bank of Nigeria (CBN)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Relevant Guidelines:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Payment Service Bank (PSB) Guidelines</li>
                        <li>Anti-Money Laundering/Combating the Financing of Terrorism (AML/CFT) Regulations</li>
                        <li>Know Your Customer (KYC) Requirements</li>
                        <li>Consumer Protection Framework</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Our Compliance:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Robust KYC and customer onboarding procedures</li>
                        <li>Transaction monitoring and suspicious activity reporting</li>
                        <li>Consumer protection and fair treatment policies</li>
                        <li>Data protection and privacy compliance</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nigerian Financial Intelligence Unit (NFIU)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">AML/CFT Compliance:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Customer Due Diligence (CDD) procedures</li>
                        <li>Enhanced Due Diligence (EDD) for high-risk customers</li>
                        <li>Politically Exposed Persons (PEP) screening</li>
                        <li>Suspicious Transaction Report (STR) filing</li>
                        <li>Currency Transaction Report (CTR) compliance</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                International Standards and Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">FATF Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                      <li>Risk-based approach to AML/CFT</li>
                      <li>Virtual Asset Service Provider (VASP) recommendations</li>
                      <li>Travel Rule compliance for crypto transactions</li>
                      <li>Beneficial ownership identification</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Protection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                      <li>Nigerian Data Protection Regulation (NDPR) compliance</li>
                      <li>GDPR principles where applicable</li>
                      <li>Cross-border data transfer safeguards</li>
                      <li>Privacy by design implementation</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Investment Structure and Legal Framework</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                      Tokenization Legal Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Property Ownership Structure:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Properties are held through Nigerian incorporated Special Purpose Vehicles (SPVs)</li>
                        <li>SPVs hold legal title to the underlying real estate assets</li>
                        <li>Tokens represent beneficial interests in the SPV and underlying property</li>
                        <li>Corporate governance ensures proper management and oversight</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Token Legal Status:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Tokens are structured as security tokens under Nigerian law</li>
                        <li>Comply with applicable securities regulations</li>
                        <li>Subject to investor protection measures</li>
                        <li>Clear rights and obligations documented</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Property Due Diligence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Legal Due Diligence Process:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li><strong>Title Verification:</strong> Certificate of Occupancy (C of O) verification</li>
                        <li><strong>Legal Search:</strong> State lands registry search and title confirmation</li>
                        <li><strong>Encumbrance Check:</strong> Verification of liens, mortgages, or other claims</li>
                        <li><strong>Zoning Compliance:</strong> Confirmation of proper zoning and permits</li>
                        <li><strong>Valuation:</strong> Independent professional property valuation</li>
                        <li><strong>Insurance:</strong> Comprehensive property insurance coverage</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Investor Classifications and Limits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Retail Investors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge className="bg-blue-100 text-blue-800">Standard Tier</Badge>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                        <li>Maximum investment: ₦10,000,000 per property</li>
                        <li>Annual investment limit: ₦50,000,000</li>
                        <li>Standard KYC requirements</li>
                        <li>Basic investor education required</li>
                        <li>Cooling-off period: 48 hours</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sophisticated Investors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge className="bg-green-100 text-green-800">Premium Tier</Badge>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                        <li>Higher investment limits available</li>
                        <li>Enhanced due diligence requirements</li>
                        <li>Minimum net worth: ₦100,000,000</li>
                        <li>Professional investment experience</li>
                        <li>Access to exclusive opportunities</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Regulatory Monitoring and Reporting</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Regular Reporting Requirements:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Monthly transaction reports to relevant authorities</li>
                      <li>Quarterly compliance certification</li>
                      <li>Annual audited financial statements</li>
                      <li>Suspicious activity reports as required</li>
                      <li>Regulatory correspondence and communications</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Ongoing Monitoring:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Real-time transaction monitoring systems</li>
                      <li>Regular compliance reviews and updates</li>
                      <li>External compliance audits</li>
                      <li>Regulatory change monitoring and implementation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Dispute Resolution Framework</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Multi-Tier Resolution Process:</h4>
                    <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                      <li><strong>Internal Resolution:</strong> Customer service and internal dispute resolution (7-14 days)</li>
                      <li><strong>Alternative Dispute Resolution:</strong> Mediation through Lagos Multi-Door Courthouse</li>
                      <li><strong>Regulatory Escalation:</strong> Complaints to SEC or other relevant regulators</li>
                      <li><strong>Arbitration:</strong> Binding arbitration under Nigerian Arbitration and Conciliation Act</li>
                      <li><strong>Court Proceedings:</strong> Nigerian courts as final resort</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Investor Protection Measures:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Professional indemnity insurance coverage</li>
                      <li>Client money segregation and protection</li>
                      <li>Independent custody arrangements</li>
                      <li>Regular third-party audits</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Tax Implications and Guidance</h2>
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-amber-800 font-medium">
                      Important Tax Notice: This information is for general guidance only. 
                      Consult qualified tax advisors for specific tax advice.
                    </p>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Potential Tax Considerations:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Capital gains tax on token appreciation</li>
                        <li>Income tax on dividend distributions</li>
                        <li>Stamp duty on property transactions</li>
                        <li>Value Added Tax (VAT) implications</li>
                        <li>Withholding tax on investment returns</li>
                      </ul>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Tax treatment of digital assets and real estate tokens continues to evolve. 
                      PropChain provides annual tax reporting documents but does not provide tax advice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Regulatory Compliance Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For regulatory inquiries, compliance matters, or legal questions:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Compliance Officer:</strong> compliance@propchain.ng</p>
                <p><strong>Legal Department:</strong> legal@propchain.ng</p>
                <p><strong>Regulatory Affairs:</strong> regulatory@propchain.ng</p>
                <p><strong>Address:</strong> PropChain Regulatory Office, Lagos, Nigeria</p>
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Disclaimer:</strong> This information is current as of the date shown above. 
                  Regulatory requirements may change, and this document will be updated accordingly. 
                  This document does not constitute legal advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}