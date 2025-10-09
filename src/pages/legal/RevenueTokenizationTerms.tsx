import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const RevenueTokenizationTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Revenue Tokenization Terms & Conditions</h1>
            <p className="text-muted-foreground">Complete legal disclosure for revenue-sharing property tokenization</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Definition & Structure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Revenue tokenization creates a contractual right to receive a percentage share of property revenue.
                Token holders are income beneficiaries ONLY - NOT property owners and NOT lenders.
              </p>
              <h4>Key Characteristics:</h4>
              <ul>
                <li>Tokens represent contractual right to revenue percentage</li>
                <li>Token holders receive ONLY income distributions, nothing else</li>
                <li>NO ownership, NO equity, NO voting rights, NO capital appreciation</li>
                <li>Contract duration may be fixed term or perpetual</li>
                <li>Payments fluctuate with property revenue performance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Revenue Share Structure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4>Revenue Definition:</h4>
                <ul>
                  <li>Gross revenue: All income from property operations</li>
                  <li>Includes: Rent, late fees, parking fees, amenity fees, etc.</li>
                  <li>Net revenue: Gross revenue MINUS operating expenses</li>
                  <li>Typical share is based on NET revenue (after expenses)</li>
                </ul>
              </div>
              <div>
                <h4>Expense Deductions (Before Revenue Share):</h4>
                <ul>
                  <li>Property taxes and insurance</li>
                  <li>Maintenance and repairs</li>
                  <li>Property management fees</li>
                  <li>Utilities (if owner-paid)</li>
                  <li>HOA fees and assessments</li>
                  <li>Legal and professional fees</li>
                  <li>Capital improvements (may be deducted)</li>
                </ul>
              </div>
              <div>
                <h4>Distribution Timing:</h4>
                <ul>
                  <li>Monthly, quarterly, or annual distributions (as specified)</li>
                  <li>Payments made within 30-60 days after period end</li>
                  <li>Zero or negative cash flow = zero distribution</li>
                  <li>No obligation to make minimum payments</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. What Token Holders Receive</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Income Rights ONLY:</h4>
              <ul>
                <li>Percentage share of net property revenue as specified</li>
                <li>Financial reports showing revenue and expense calculations</li>
                <li>Notice of material changes to property operations</li>
              </ul>
              <h4>That's it. Nothing else.</h4>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. What Token Holders DO NOT Receive</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>NO Ownership Rights:</h4>
              <ul>
                <li>NO equity stake or ownership interest in property</li>
                <li>NO share of property appreciation or sale proceeds</li>
                <li>NO claim on property assets</li>
                <li>NO collateral security or lien rights</li>
              </ul>
              <h4>NO Control Rights:</h4>
              <ul>
                <li>NO voting rights on property management</li>
                <li>NO say in tenant selection, rent levels, or expenses</li>
                <li>NO ability to force property sale or refinancing</li>
                <li>NO right to inspect or access property</li>
              </ul>
              <h4>NO Guarantees:</h4>
              <ul>
                <li>NO minimum payment guarantees</li>
                <li>NO guarantee of positive cash flow</li>
                <li>NO return of principal/capital</li>
                <li>NO protection against revenue decline</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Contract Duration & Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4>Contract Term:</h4>
                <ul>
                  <li>May be fixed term (e.g., 5-10 years) or perpetual</li>
                  <li>Term specified in tokenization agreement</li>
                  <li>Automatic renewal may or may not apply</li>
                </ul>
              </div>
              <div>
                <h4>Early Termination Events:</h4>
                <ul>
                  <li>Property sale: Contract typically terminates with no further payments</li>
                  <li>Property demolition or destruction: Contract may terminate</li>
                  <li>Owner buyout: Owner may have right to buy out revenue stream</li>
                  <li>Lease expiration: If tied to specific lease, may terminate</li>
                  <li>Mutual agreement: Both parties agree to termination</li>
                </ul>
              </div>
              <div>
                <h4>No Termination Payment:</h4>
                <p className="text-muted-foreground">
                  <strong>Critical:</strong> Early termination typically does NOT require payment to token holders.
                  You may receive ZERO compensation if contract terminates early. No return of "principal" or 
                  exit payment is guaranteed.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Risk Factors</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Revenue Volatility Risk:</h4>
              <ul>
                <li>Revenue fluctuates significantly with occupancy and market conditions</li>
                <li>Extended vacancy periods result in zero or negative revenue</li>
                <li>Seasonal properties may have months with zero income</li>
                <li>Tenant defaults immediately reduce revenue</li>
                <li>Economic downturns can severely impact rental income</li>
              </ul>
              <h4>Expense Risk:</h4>
              <ul>
                <li>High operating expenses can consume all revenue</li>
                <li>Unexpected repairs reduce distributable cash flow</li>
                <li>Property taxes and insurance increase over time</li>
                <li>Owner has discretion over many expense categories</li>
                <li>Capital improvements may be deducted from revenue</li>
              </ul>
              <h4>No Capital Appreciation:</h4>
              <ul>
                <li>Property value increase provides ZERO benefit to token holders</li>
                <li>Miss out on potentially significant property appreciation</li>
                <li>If property doubles in value, your revenue share doesn't change</li>
              </ul>
              <h4>Contract Termination Risk:</h4>
              <ul>
                <li>Owner can sell property and terminate contract</li>
                <li>No termination payment or compensation typically required</li>
                <li>May receive zero further payments with no recourse</li>
                <li>Contract may not be renewed at end of term</li>
              </ul>
              <h4>Liquidity Risk:</h4>
              <ul>
                <li>Extremely limited secondary market for revenue tokens</li>
                <li>May be impossible to sell tokens at any price</li>
                <li>Value is entirely dependent on future revenue projections</li>
                <li>No established valuation methodology</li>
              </ul>
              <h4>Priority Risk:</h4>
              <ul>
                <li>Property lenders (mortgages) have priority over revenue share</li>
                <li>If property foreclosed, contract likely terminates</li>
                <li>No claim on property sale proceeds</li>
                <li>Unsecured contractual right only</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Owner's Rights & Discretion</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Owner Retains Full Control:</h4>
              <ul>
                <li>Set rental rates and tenant selection criteria</li>
                <li>Determine timing and extent of repairs/maintenance</li>
                <li>Decide on capital improvements and renovations</li>
                <li>Hire and fire property management</li>
                <li>Refinance, encumber, or sell property at any time</li>
                <li>Determine expense classifications and allocations</li>
              </ul>
              <h4>Conflicts of Interest:</h4>
              <ul>
                <li>Owner incentivized to maximize expenses (reduces your share)</li>
                <li>Owner may overpay affiliated service providers</li>
                <li>No fiduciary duty to maximize your revenue share</li>
                <li>Limited recourse if you disagree with owner's decisions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Tax Implications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Revenue share payments are typically taxable as ordinary income. Consult with a tax professional.
              </p>
              <h4>Tax Considerations:</h4>
              <ul>
                <li>Revenue distributions taxable as ordinary income (not capital gains)</li>
                <li>No tax benefits of property ownership (depreciation, mortgage interest)</li>
                <li>May receive 1099 or K-1 depending on structure</li>
                <li>Contract termination may or may not trigger taxable event</li>
                <li>Token sale may result in capital gain or loss</li>
                <li>State and local taxes may also apply</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Reporting & Transparency</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Owner Reporting Obligations:</h4>
              <ul>
                <li>Quarterly or annual financial statements (as specified)</li>
                <li>Revenue and expense breakdown</li>
                <li>Occupancy and lease status reports</li>
                <li>Notice of material events (sale, major repairs, etc.)</li>
              </ul>
              <h4>Limited Audit Rights:</h4>
              <ul>
                <li>Token holders may have limited or no audit rights</li>
                <li>Must rely on owner's financial reporting</li>
                <li>Dispute resolution may be costly and difficult</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Fees & Costs</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Platform Fees:</h4>
              <ul>
                <li>Origination fee (typically 1-3% of funds raised)</li>
                <li>Ongoing servicing fee (0.25-1% of distributions)</li>
                <li>Distribution processing fees</li>
                <li>Blockchain transaction costs</li>
              </ul>
              <h4>Property-Level Fees (Deducted Before Revenue Share):</h4>
              <ul>
                <li>Property management fee (typically 8-12% of revenue)</li>
                <li>Leasing commissions</li>
                <li>Accounting and bookkeeping</li>
                <li>All operating expenses</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Regulatory Compliance</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Securities Regulations:</h4>
              <p>
                Revenue tokens may be classified as securities. Compliance requirements may include:
              </p>
              <ul>
                <li>Registration or exemption requirements</li>
                <li>Investor accreditation limitations</li>
                <li>Transfer restrictions</li>
                <li>Ongoing disclosure obligations</li>
              </ul>
              <h4>Contract Law:</h4>
              <ul>
                <li>Revenue share agreements governed by contract law</li>
                <li>Enforceability depends on contract terms and jurisdiction</li>
                <li>Legal recourse for breach may be limited</li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Critical Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Revenue sharing is the HIGHEST RISK tokenization type.</strong> You have NO ownership, NO collateral,
                NO guaranteed payments, and NO return of capital. Revenue can be ZERO for extended periods. Expenses can
                consume all income. Contract can terminate with ZERO compensation to you.
              </p>
              <p className="text-sm text-muted-foreground">
                This structure is suitable ONLY for sophisticated investors who understand they may lose their entire
                investment and receive zero or minimal distributions. This is a speculative, income-only investment with
                no capital appreciation potential. Do NOT invest money you cannot afford to lose entirely. This document
                is for informational purposes only and does not constitute legal, financial, or investment advice.
                Consult with qualified advisors before proceeding. By investing, you acknowledge you have read,
                understood, and accept all risks outlined in this document.
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

export default RevenueTokenizationTerms;
