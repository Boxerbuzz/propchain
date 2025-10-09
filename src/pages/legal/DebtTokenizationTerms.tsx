import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const DebtTokenizationTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Banknote className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Debt Tokenization Terms & Conditions</h1>
            <p className="text-muted-foreground">Complete legal disclosure for debt-based property tokenization</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Definition & Structure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Debt tokenization represents a loan secured by real property, where each token represents a fractional
                interest in the loan obligation. Token holders are lenders/creditors, NOT property owners.
              </p>
              <h4>Key Characteristics:</h4>
              <ul>
                <li>Tokens represent fractional creditor rights in a property-secured loan</li>
                <li>Token holders have NO ownership or equity stake in property</li>
                <li>Loan terms include fixed interest rate, repayment schedule, and maturity date</li>
                <li>Loan is secured by property collateral</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Loan Terms & Structure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4>Interest Rate:</h4>
                <ul>
                  <li>Fixed interest rate specified in tokenization terms</li>
                  <li>Rate does NOT adjust with market conditions</li>
                  <li>Interest accrues from loan disbursement date</li>
                  <li>Calculated on actual/365 or 30/360 day count basis</li>
                </ul>
              </div>
              <div>
                <h4>Repayment Schedule:</h4>
                <ul>
                  <li>Interest-only payments during loan term (typical structure)</li>
                  <li>Principal repayment at maturity (balloon payment)</li>
                  <li>Or amortizing structure with principal + interest payments</li>
                  <li>Payment frequency: monthly, quarterly, or at maturity</li>
                </ul>
              </div>
              <div>
                <h4>Loan-to-Value (LTV) Ratio:</h4>
                <ul>
                  <li>LTV ratio indicates loan amount relative to property value</li>
                  <li>Lower LTV = more equity cushion = lower risk</li>
                  <li>Higher LTV = less equity cushion = higher risk</li>
                  <li>Typical range: 50-75% LTV for real estate loans</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Rights & Obligations of Token Holders</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4>Creditor Rights:</h4>
                <ul>
                  <li>Right to receive interest payments per agreed schedule</li>
                  <li>Right to principal repayment at maturity</li>
                  <li>Priority claim on collateral in default scenarios</li>
                  <li>Right to loan performance reports and borrower updates</li>
                  <li>Right to enforce loan covenants and remedies</li>
                </ul>
              </div>
              <div>
                <h4>What Token Holders DO NOT Have:</h4>
                <ul>
                  <li>NO ownership or equity stake in property</li>
                  <li>NO voting rights on property management</li>
                  <li>NO participation in property appreciation</li>
                  <li>NO share of rental income beyond fixed interest</li>
                  <li>NO right to occupy or use the property</li>
                </ul>
              </div>
              <div>
                <h4>Obligations:</h4>
                <ul>
                  <li>Cannot demand early repayment unless default occurs</li>
                  <li>Must hold tokens until maturity or secondary sale</li>
                  <li>Tax reporting obligations for interest income</li>
                  <li>KYC/AML compliance requirements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Collateral & Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Security Interest:</h4>
              <ul>
                <li>Loan secured by first-priority lien on property (typically)</li>
                <li>Security interest perfected by recording mortgage/deed of trust</li>
                <li>Token holders have collective security interest</li>
                <li>Additional collateral or guarantees may be included</li>
              </ul>
              <h4>Collateral Maintenance:</h4>
              <ul>
                <li>Borrower must maintain property insurance</li>
                <li>Borrower must pay property taxes and assessments</li>
                <li>Borrower must maintain property in good condition</li>
                <li>Borrower may be restricted from additional liens</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Default & Remedies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4>Events of Default:</h4>
                <ul>
                  <li>Failure to make interest or principal payments when due</li>
                  <li>Breach of loan covenants or representations</li>
                  <li>Failure to maintain property insurance or pay taxes</li>
                  <li>Bankruptcy or insolvency of borrower</li>
                  <li>Unauthorized transfer or encumbrance of property</li>
                </ul>
              </div>
              <div>
                <h4>Remedies Upon Default:</h4>
                <ul>
                  <li>Acceleration of entire loan balance (all amounts become due immediately)</li>
                  <li>Foreclosure proceedings to seize and sell collateral</li>
                  <li>Default interest rate penalty (typically 2-5% above contract rate)</li>
                  <li>Right to take possession and operate property</li>
                  <li>Legal action to recover deficiency if collateral insufficient</li>
                </ul>
              </div>
              <div>
                <h4>Foreclosure Process:</h4>
                <ul>
                  <li>Notice period (typically 30-90 days depending on jurisdiction)</li>
                  <li>Judicial or non-judicial foreclosure based on local law</li>
                  <li>Timeline: 6 months to 2+ years depending on jurisdiction</li>
                  <li>Foreclosure costs reduce net recovery amount</li>
                  <li>No guarantee of full recovery of principal and interest</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Risk Factors</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Credit Risk:</h4>
              <ul>
                <li>Borrower may default on payments - primary risk</li>
                <li>Default likelihood increases with borrower financial distress</li>
                <li>No guarantee of timely payments or principal repayment</li>
                <li>Late payments may disrupt expected cash flows</li>
              </ul>
              <h4>Collateral Risk:</h4>
              <ul>
                <li>Property value may decline below loan amount</li>
                <li>High LTV ratios provide limited protection</li>
                <li>Property damage or deterioration reduces collateral value</li>
                <li>Market conditions may prevent sale at appraised value</li>
              </ul>
              <h4>Recovery Risk:</h4>
              <ul>
                <li>Foreclosure may recover less than full loan amount</li>
                <li>Foreclosure costs reduce net proceeds to lenders</li>
                <li>Legal delays can take years and accrue costs</li>
                <li>Bankruptcy proceedings may subordinate or delay claims</li>
              </ul>
              <h4>Liquidity Risk:</h4>
              <ul>
                <li>Cannot demand early repayment except in default</li>
                <li>Limited secondary market for debt tokens</li>
                <li>May need to sell at discount if liquidity required</li>
                <li>Locked into investment until maturity</li>
              </ul>
              <h4>Interest Rate Risk:</h4>
              <ul>
                <li>Fixed rate means no benefit if market rates rise</li>
                <li>If market rates increase, token value may decrease</li>
                <li>Opportunity cost if better investments become available</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Tax Implications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Interest income from debt tokens is typically taxable as ordinary income. Consult with a tax professional.
              </p>
              <h4>Tax Considerations:</h4>
              <ul>
                <li>Interest payments taxable as ordinary income (not capital gains)</li>
                <li>No tax advantages of property ownership (depreciation, etc.)</li>
                <li>Default or foreclosure may result in bad debt deductions</li>
                <li>Token sales may trigger capital gains or losses</li>
                <li>State and local taxes may also apply</li>
                <li>Cross-border investments may trigger withholding taxes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Prepayment</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Borrower Prepayment Rights:</h4>
              <ul>
                <li>Borrower may be permitted to prepay loan early</li>
                <li>Prepayment penalty may apply (typically 1-3% of principal)</li>
                <li>Lock-out period may prohibit early prepayment initially</li>
                <li>Early prepayment reduces total interest income to lenders</li>
              </ul>
              <h4>Yield Maintenance vs. Defeasance:</h4>
              <ul>
                <li>Yield maintenance: ensures lenders receive promised yield despite prepayment</li>
                <li>Defeasance: borrower substitutes collateral with securities</li>
                <li>Structure depends on loan terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Fees & Costs</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Lender Fees (Charged to Borrower):</h4>
              <ul>
                <li>Origination fee (typically 1-2% of loan amount)</li>
                <li>Processing and underwriting fees</li>
                <li>Appraisal and title insurance costs</li>
                <li>Legal documentation fees</li>
              </ul>
              <h4>Platform Fees (Charged to Token Holders):</h4>
              <ul>
                <li>Servicing fee (typically 0.25-1% annually)</li>
                <li>Distribution processing fees</li>
                <li>Blockchain transaction fees</li>
              </ul>
              <h4>Default/Foreclosure Costs:</h4>
              <ul>
                <li>Legal fees for foreclosure proceedings</li>
                <li>Property preservation costs</li>
                <li>Court costs and filing fees</li>
                <li>All costs reduce net recovery to token holders</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Regulatory Compliance</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Securities Regulations:</h4>
              <p>
                Debt tokens may be classified as securities and subject to securities regulations. Compliance requirements include:
              </p>
              <ul>
                <li>Registration or exemption filing requirements</li>
                <li>Investor accreditation requirements (may apply)</li>
                <li>Transfer restrictions and holding periods</li>
                <li>Disclosure and reporting obligations</li>
              </ul>
              <h4>Lending Regulations:</h4>
              <ul>
                <li>Usury laws limiting maximum interest rates</li>
                <li>Truth in Lending Act disclosures</li>
                <li>Fair Lending and anti-discrimination requirements</li>
                <li>State licensing requirements for loan originators</li>
              </ul>
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
                Debt tokenization carries substantial credit and collateral risk including potential loss of invested capital.
                Default rates vary widely and borrower creditworthiness can deteriorate rapidly. Foreclosure is costly and
                time-consuming with uncertain outcomes. You should consult with qualified legal, tax, and financial advisors
                before making any investment decision. By proceeding with debt tokenization or investment, you acknowledge
                that you have read, understood, and accept all risks outlined in this document.
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

export default DebtTokenizationTerms;
