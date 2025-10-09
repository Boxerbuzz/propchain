import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronDown, AlertTriangle, Building, Banknote, TrendingUp, Info } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface InvestmentTermsDisclosureProps {
  tokenizationType: "equity" | "debt" | "revenue";
  tokenName: string;
  tokenSymbol?: string;
  amount: number;
  tokens: number;
  expectedRoi?: number;
  interestRate?: number;
  revenueShare?: number;
}

const InvestmentTermsDisclosure = ({
  tokenizationType,
  tokenName,
  tokenSymbol,
  amount,
  tokens,
  expectedRoi,
  interestRate,
  revenueShare,
}: InvestmentTermsDisclosureProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeLabel = () => {
    switch (tokenizationType) {
      case "equity": return "Equity Ownership";
      case "debt": return "Debt Lending";
      case "revenue": return "Revenue Sharing";
    }
  };

  const getTypeIcon = () => {
    switch (tokenizationType) {
      case "equity": return <Building className="h-4 w-4" />;
      case "debt": return <Banknote className="h-4 w-4" />;
      case "revenue": return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTypeLegalUrl = () => {
    switch (tokenizationType) {
      case "equity": return "/legal/equity-tokenization-terms";
      case "debt": return "/legal/debt-tokenization-terms";
      case "revenue": return "/legal/revenue-tokenization-terms";
    }
  };

  const renderEquityTerms = () => (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-sm mb-1">What You're Investing In</h4>
        <p className="text-sm text-muted-foreground">
          You are purchasing fractional ownership in a property. Your {tokens.toLocaleString()} tokens represent a proportional share of the property's value and revenue.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-1">Your Rights</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Proportional share of rental income distributions</li>
          <li>Voting rights on major property decisions (if enabled)</li>
          <li>Share of property appreciation upon sale</li>
          <li>Access to property financial reports</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Key Risks
        </h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li><strong>Illiquidity:</strong> Tokens may be difficult or impossible to sell</li>
          <li><strong>Market Risk:</strong> Property value may decrease</li>
          <li><strong>Income Risk:</strong> Rental income not guaranteed</li>
          <li><strong>Management Risk:</strong> Property performance depends on management quality</li>
          <li><strong>Regulatory Risk:</strong> Changes in laws may affect your investment</li>
        </ul>
      </div>
      {expectedRoi && (
        <div>
          <h4 className="font-semibold text-sm mb-1">Expected Returns</h4>
          <p className="text-sm text-muted-foreground">
            Estimated annual ROI of {expectedRoi}% is a projection only and not guaranteed. Actual returns may be higher or lower.
          </p>
        </div>
      )}
    </div>
  );

  const renderDebtTerms = () => (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-sm mb-1">What You're Investing In</h4>
        <p className="text-sm text-muted-foreground">
          You are lending money to the property owner. This is a LOAN, not ownership. You will receive interest payments and principal repayment.
        </p>
      </div>
      {interestRate && (
        <div>
          <h4 className="font-semibold text-sm mb-1">Interest Rate</h4>
          <p className="text-sm text-muted-foreground">
            Fixed interest rate of {interestRate}% per annum. Interest payments distributed according to schedule.
          </p>
        </div>
      )}
      <div>
        <h4 className="font-semibold text-sm mb-1">Your Rights</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Fixed interest payments according to schedule</li>
          <li>Principal repayment at loan maturity</li>
          <li>Priority claim on collateral in default scenarios</li>
          <li>No voting rights or ownership stake</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Key Risks
        </h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li><strong>Default Risk:</strong> Borrower may fail to make payments</li>
          <li><strong>Collateral Risk:</strong> Property value may fall below loan amount</li>
          <li><strong>Illiquidity:</strong> Cannot withdraw funds before maturity</li>
          <li><strong>No Upside:</strong> No participation in property appreciation</li>
          <li><strong>Recovery Risk:</strong> In default, recovery may be partial or delayed</li>
        </ul>
      </div>
    </div>
  );

  const renderRevenueTerms = () => (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-sm mb-1">What You're Investing In</h4>
        <p className="text-sm text-muted-foreground">
          You are purchasing a share of property revenue only. You will receive {revenueShare}% of net revenue. This is NOT ownership and NOT a loan.
        </p>
      </div>
      {revenueShare && (
        <div>
          <h4 className="font-semibold text-sm mb-1">Revenue Share</h4>
          <p className="text-sm text-muted-foreground">
            You will receive {revenueShare}% of net revenue after operating expenses, maintenance, taxes, and management fees.
          </p>
        </div>
      )}
      <div>
        <h4 className="font-semibold text-sm mb-1">What You DO NOT Get</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>NO ownership or equity stake in property</li>
          <li>NO voting rights or decision-making power</li>
          <li>NO share of property appreciation or sale proceeds</li>
          <li>NO guaranteed payments or minimum income</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Key Risks
        </h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li><strong>Revenue Volatility:</strong> Payments fluctuate with property income</li>
          <li><strong>Zero Income Periods:</strong> No revenue = no payments</li>
          <li><strong>No Capital Gains:</strong> No benefit from property value increase</li>
          <li><strong>Contract Termination:</strong> May end upon property sale or lease expiration</li>
          <li><strong>Operating Costs:</strong> High costs can eliminate all revenue</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          {getTypeIcon()}
          Investment Type: {getTypeLabel()}
        </AlertTitle>
        <AlertDescription>
          This is a {getTypeLabel()} investment. Please review the specific terms and risks below.
        </AlertDescription>
      </Alert>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Investment Terms, Rights & Risks
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 border border-t-0 rounded-b-lg bg-muted/20 space-y-4">
            {tokenizationType === "equity" && renderEquityTerms()}
            {tokenizationType === "debt" && renderDebtTerms()}
            {tokenizationType === "revenue" && renderRevenueTerms()}

            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                For complete legal terms, please review our{" "}
                <Link to={getTypeLegalUrl()} target="_blank" className="text-primary hover:underline">
                  {getTypeLabel()} Investment Terms
                </Link>
                .
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Important:</strong> Real estate investments carry risk. You may lose some or all of your investment. 
          Only invest what you can afford to lose. Past performance does not guarantee future results.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default InvestmentTermsDisclosure;
