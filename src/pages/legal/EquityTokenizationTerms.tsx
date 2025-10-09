import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const EquityTokenizationTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Equity Tokenization Terms & Conditions</h1>
            <p className="text-muted-foreground">Complete legal disclosure for equity-based property tokenization</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Definition & Structure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Equity tokenization represents the fractional ownership of real property through blockchain-based digital tokens.
                Each token confers upon the holder a proportional ownership interest in the underlying property asset.
              </p>
              <h4>Key Characteristics:</h4>
              <ul>
                <li>Tokens represent fractional ownership shares in property</li>
                <li>Token holders are beneficial owners with economic rights</li>
                <li>Ownership is recorded on the Hedera blockchain network</li>
                <li>Each token has equal rights unless otherwise specified</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Rights & Obligations of Token Holders</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4>Economic Rights:</h4>
                <ul>
                  <li>Proportional share of net rental income after expenses</li>
                  <li>Proportional share of property appreciation</li>
                  <li>Proportional share of sale proceeds after costs</li>
                  <li>Right to receive financial statements and performance reports</li>
                </ul>
              </div>
              <div>
                <h4>Governance Rights:</h4>
                <ul>
                  <li>Voting rights on major property decisions (if enabled)</li>
                  <li>One token equals one vote unless otherwise specified</li>
                  <li>Right to propose governance resolutions</li>
                  <li>Right to participate in token holder meetings</li>
                </ul>
              </div>
              <div>
                <h4>Obligations:</h4>
                <ul>
                  <li>Proportional liability for property-related obligations</li>
                  <li>Compliance with platform rules and regulations</li>
                  <li>Tax reporting as required by applicable law</li>
                  <li>Maintenance of KYC/AML verification</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Distribution Waterfall:</h4>
              <ol>
                <li>Property operating expenses (maintenance, taxes, insurance)</li>
                <li>Management fees and platform fees</li>
                <li>Reserve fund allocation (typically 10-20% of net income)</li>
                <li>Distribution to token holders proportionally</li>
              </ol>
              <p className="text-muted-foreground mt-4">
                <strong>Important:</strong> Distributions are NOT guaranteed. Zero or negative cash flow periods will result in no distributions.
                Property owner reserves the right to retain funds for capital improvements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Liquidity & Exit Strategy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4>Liquidity Considerations:</h4>
                <ul>
                  <li>Tokens may be highly illiquid with no active secondary market</li>
                  <li>Transfer restrictions may apply based on regulatory requirements</li>
                  <li>Lock-up periods may prevent sales for specified durations</li>
                  <li>Platform may facilitate secondary trading subject to availability</li>
                </ul>
              </div>
              <div>
                <h4>Exit Mechanisms:</h4>
                <ul>
                  <li><strong>Property Sale:</strong> Requires majority token holder approval (typically 66%+)</li>
                  <li><strong>Token Sale:</strong> Subject to finding a willing buyer and platform approval</li>
                  <li><strong>Buyback:</strong> Property owner may offer to buy back tokens (not guaranteed)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Risk Factors</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Market Risks:</h4>
              <ul>
                <li>Property values may decrease due to economic conditions</li>
                <li>Real estate market downturns can result in capital losses</li>
                <li>Local market conditions may deteriorate</li>
                <li>Interest rate changes may affect property valuations</li>
              </ul>
              <h4>Operational Risks:</h4>
              <ul>
                <li>Property may remain vacant for extended periods</li>
                <li>Tenant defaults may disrupt income streams</li>
                <li>Unexpected maintenance costs may exceed reserves</li>
                <li>Property management quality affects performance</li>
              </ul>
              <h4>Liquidity Risks:</h4>
              <ul>
                <li>May be unable to sell tokens for months or years</li>
                <li>No established market price or trading volume</li>
                <li>Forced to sell at significant discount if liquidity needed</li>
              </ul>
              <h4>Regulatory Risks:</h4>
              <ul>
                <li>Securities laws may change affecting token validity</li>
                <li>Tax treatment may be unfavorable or uncertain</li>
                <li>Zoning or property regulations may affect value</li>
                <li>Blockchain regulations may impact token transferability</li>
              </ul>
              <h4>Technology Risks:</h4>
              <ul>
                <li>Smart contract bugs or vulnerabilities</li>
                <li>Blockchain network disruptions</li>
                <li>Loss of private keys results in permanent loss of tokens</li>
                <li>Platform technology failures or shutdowns</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Tax Implications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Token holders may be subject to various tax obligations depending on jurisdiction. Consult with a tax professional.
              </p>
              <h4>Potential Tax Consequences:</h4>
              <ul>
                <li>Rental income distributions may be taxable as ordinary income</li>
                <li>Property appreciation may result in capital gains tax upon sale</li>
                <li>Token sales may trigger capital gains or losses</li>
                <li>Property-level taxes (property tax) reduce net income</li>
                <li>Foreign ownership may trigger withholding taxes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Regulatory Compliance</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Securities Regulations:</h4>
              <p>
                Equity tokens may be considered securities under applicable law. Token issuers and holders must comply with:
              </p>
              <ul>
                <li>Securities registration requirements or exemptions</li>
                <li>Accredited investor limitations (if applicable)</li>
                <li>Transfer restrictions and holding periods</li>
                <li>Disclosure and reporting obligations</li>
              </ul>
              <h4>KYC/AML Requirements:</h4>
              <ul>
                <li>All token holders must complete identity verification</li>
                <li>Source of funds documentation may be required</li>
                <li>Ongoing monitoring for suspicious activity</li>
                <li>Sanctions screening and watchlist checks</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Fees & Costs</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Upfront Fees:</h4>
              <ul>
                <li>Platform origination fee (typically 1-3% of funds raised)</li>
                <li>Legal and compliance costs</li>
                <li>Property valuation and due diligence costs</li>
                <li>Blockchain gas fees for token creation</li>
              </ul>
              <h4>Ongoing Fees:</h4>
              <ul>
                <li>Property management fee (typically 8-12% of gross income)</li>
                <li>Platform management fee (typically 0.5-1.5% annually)</li>
                <li>Accounting and reporting fees</li>
                <li>Insurance and maintenance reserves</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Any disputes arising from tokenization shall be resolved through binding arbitration in accordance with
                the laws of the jurisdiction where the property is located, unless otherwise specified in the token agreement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                These terms are governed by the laws of the jurisdiction in which the property is located and/or the
                jurisdiction of the platform operator. Token holders consent to the jurisdiction of courts in such location.
              </p>
            </CardContent>
          </Card>

          <Separator />

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Important Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This document is for informational purposes only and does not constitute legal, financial, or investment advice.
                Real estate tokenization carries substantial risk including total loss of invested capital. Past performance
                does not guarantee future results. You should consult with qualified legal, tax, and financial advisors before
                making any investment decision. By proceeding with tokenization or investment, you acknowledge that you have
                read, understood, and accept all risks outlined in this document.
              </p>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>Last Updated: January 2025</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquityTokenizationTerms;
