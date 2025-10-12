import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Shield, ChevronDown, FileText, Building, Banknote, TrendingUp, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { FundAllocation } from "./FundAllocationBuilder";

interface TokenizationTermsAcceptanceProps {
  tokenizationType: "equity" | "debt" | "revenue";
  tokenName: string;
  totalSupply: number;
  useOfFunds?: FundAllocation[];
  targetRaise?: number;
  onAccept: () => void;
  onDecline: () => void;
  isSubmitting?: boolean;
}

const TokenizationTermsAcceptance = ({
  tokenizationType,
  tokenName,
  totalSupply,
  useOfFunds = [],
  targetRaise = 0,
  onAccept,
  onDecline,
  isSubmitting = false
}: TokenizationTermsAcceptanceProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [checkboxes, setCheckboxes] = useState({
    ownership: false,
    regulatory: false,
    fees: false,
    typeSpecific: false,
    blockchain: false,
    obligations: false,
    terms: false,
    useOfFunds: false,
  });

  const allChecked = Object.values(checkboxes).every(v => v);

  const toggleCheckbox = (key: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getTypeIcon = () => {
    switch (tokenizationType) {
      case "equity": return <Building className="h-5 w-5" />;
      case "debt": return <Banknote className="h-5 w-5" />;
      case "revenue": return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (tokenizationType) {
      case "equity": return "Equity Ownership";
      case "debt": return "Debt Lending";
      case "revenue": return "Revenue Sharing";
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
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-semibold">Ownership Structure</h4>
        <p className="text-sm text-muted-foreground">
          Each token represents a fractional ownership share in the property. Token holders will participate proportionally in property appreciation, rental income distributions, and capital gains upon sale.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Voting Rights</h4>
        <p className="text-sm text-muted-foreground">
          Token holders may have voting rights on major property decisions including renovations, sale proposals, and management changes. Voting power is proportional to token ownership.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Exit Strategy & Liquidity</h4>
        <p className="text-sm text-muted-foreground">
          Tokens may be illiquid for extended periods. Secondary market trading is subject to regulatory approval and platform availability. Property sale requires majority token holder approval.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Risk Factors</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Property value may decrease due to market conditions</li>
          <li>Rental income not guaranteed and may fluctuate</li>
          <li>Limited liquidity - tokens may be difficult to sell</li>
          <li>Dilution risk if additional tokens are issued</li>
          <li>Regulatory changes may affect token ownership rights</li>
        </ul>
      </div>
    </div>
  );

  const renderDebtTerms = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-semibold">Loan Structure</h4>
        <p className="text-sm text-muted-foreground">
          This is a debt instrument where token holders are lenders to the property owner. Principal and interest will be repaid according to the loan schedule. This is NOT an ownership stake.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Repayment Terms</h4>
        <p className="text-sm text-muted-foreground">
          Interest payments will be distributed according to the specified frequency. Principal repayment occurs at loan maturity or according to amortization schedule. Late payments may occur.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Collateral & Security</h4>
        <p className="text-sm text-muted-foreground">
          The loan may be secured by the property and/or other collateral. LTV (Loan-to-Value) ratio determines lending risk. In default scenarios, token holders have priority claims on collateral.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Credit Risk</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Borrower may default on loan payments</li>
          <li>Property value may fall below loan amount</li>
          <li>Recovery in default may be partial or delayed</li>
          <li>Interest rate is fixed and won't adjust to market changes</li>
          <li>No participation in property appreciation</li>
        </ul>
      </div>
    </div>
  );

  const renderRevenueTerms = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-semibold">Revenue Sharing Model</h4>
        <p className="text-sm text-muted-foreground">
          Token holders receive a percentage share of property revenue (rental income, fees, etc.). This is an income-only instrument with NO ownership or equity rights in the property.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Payment Structure</h4>
        <p className="text-sm text-muted-foreground">
          Revenue distributions occur after deducting operating expenses, maintenance, taxes, and management fees. Payment timing depends on when property generates revenue. Zero revenue periods result in zero payments.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">No Ownership Rights</h4>
        <p className="text-sm text-muted-foreground">
          Token holders have NO voting rights, NO claim on property appreciation, and NO equity stake. You receive only the specified revenue share percentage. Owner retains full control of property decisions.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Revenue Risk</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Revenue is not guaranteed and may be zero</li>
          <li>Tenant vacancies directly reduce payments</li>
          <li>Operating costs may consume all revenue</li>
          <li>No participation in property sale proceeds</li>
          <li>Contract may terminate upon property sale or lease expiration</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Use of Funds Summary */}
      {useOfFunds.length > 0 && targetRaise > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Use of Funds Summary</CardTitle>
            <CardDescription>
              Review how the ₦{targetRaise.toLocaleString()} raised will be allocated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {useOfFunds.map(fund => (
                <div key={fund.id} className="flex justify-between items-start border-b pb-2">
                  <div className="flex-1">
                    <p className="font-medium">{fund.category}</p>
                    {fund.description && (
                      <p className="text-sm text-muted-foreground">{fund.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold">₦{fund.amount_ngn.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{fund.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Please carefully review the terms and conditions for this {getTypeLabel()} tokenization. 
          You must accept all terms before proceeding with token creation.
        </AlertDescription>
      </Alert>

      {/* Tokenization Type Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <div>
              <CardTitle>Tokenization Type: {getTypeLabel()}</CardTitle>
              <CardDescription>
                Creating {totalSupply.toLocaleString()} tokens of {tokenName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Type-Specific Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Type-Specific Terms & Conditions</CardTitle>
          <CardDescription>
            Understand the specific terms for {getTypeLabel()} tokenizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokenizationType === "equity" && renderEquityTerms()}
          {tokenizationType === "debt" && renderDebtTerms()}
          {tokenizationType === "revenue" && renderRevenueTerms()}
        </CardContent>
      </Card>

      {/* General Platform Terms */}
      <Collapsible open={expandedSection === "platform"} onOpenChange={() => 
        setExpandedSection(expandedSection === "platform" ? null : "platform")
      }>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Platform Fees & Obligations</CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSection === "platform" ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Platform Fee: 1-2.5% of funds raised</p>
              <p>• Management Fee: Ongoing percentage of revenue/returns</p>
              <p>• Transaction Fees: Gas fees for blockchain operations</p>
              <p>• Investor Communication: You must provide timely updates to token holders</p>
              <p>• Financial Reporting: Quarterly and annual financial statements required</p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Blockchain & Regulatory */}
      <Collapsible open={expandedSection === "blockchain"} onOpenChange={() => 
        setExpandedSection(expandedSection === "blockchain" ? null : "blockchain")
      }>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Blockchain & Regulatory Compliance</CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSection === "blockchain" ? "rotate-180" : ""}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Tokens will be created on Hedera blockchain network</p>
              <p>• Token creation is irreversible once confirmed on blockchain</p>
              <p>• You are responsible for compliance with local securities regulations</p>
              <p>• KYC/AML requirements apply to all token holders</p>
              <p>• Tax reporting obligations may apply to you and token holders</p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Legal Acceptance Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Required Acceptances
          </CardTitle>
          <CardDescription>
            You must check all boxes to proceed with tokenization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="ownership" 
              checked={checkboxes.ownership}
              onCheckedChange={() => toggleCheckbox("ownership")}
            />
            <Label htmlFor="ownership" className="text-sm font-normal cursor-pointer">
              I confirm that I own this property and have the legal right to tokenize it
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="regulatory" 
              checked={checkboxes.regulatory}
              onCheckedChange={() => toggleCheckbox("regulatory")}
            />
            <Label htmlFor="regulatory" className="text-sm font-normal cursor-pointer">
              I acknowledge all regulatory obligations and compliance requirements
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="fees" 
              checked={checkboxes.fees}
              onCheckedChange={() => toggleCheckbox("fees")}
            />
            <Label htmlFor="fees" className="text-sm font-normal cursor-pointer">
              I accept the platform fees, management fees, and all associated costs
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="typeSpecific" 
              checked={checkboxes.typeSpecific}
              onCheckedChange={() => toggleCheckbox("typeSpecific")}
            />
            <Label htmlFor="typeSpecific" className="text-sm font-normal cursor-pointer">
              I have reviewed and accept all {getTypeLabel()} specific terms and risks
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="blockchain" 
              checked={checkboxes.blockchain}
              onCheckedChange={() => toggleCheckbox("blockchain")}
            />
            <Label htmlFor="blockchain" className="text-sm font-normal cursor-pointer">
              I authorize token creation on Hedera blockchain (irreversible)
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="obligations" 
              checked={checkboxes.obligations}
              onCheckedChange={() => toggleCheckbox("obligations")}
            />
            <Label htmlFor="obligations" className="text-sm font-normal cursor-pointer">
              I agree to maintain investor communication and reporting obligations
            </Label>
          </div>

          {useOfFunds.length > 0 && (
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="useOfFunds" 
                checked={checkboxes.useOfFunds}
                onCheckedChange={() => toggleCheckbox("useOfFunds")}
              />
              <Label htmlFor="useOfFunds" className="text-sm font-normal cursor-pointer">
                I acknowledge the proposed use of funds and understand that actual deployment may vary subject to property owner discretion and regulatory requirements. Any material changes will be communicated to token holders.
              </Label>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              checked={checkboxes.terms}
              onCheckedChange={() => toggleCheckbox("terms")}
            />
            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
              I have read and agree to the{" "}
              <Link to={getTypeLegalUrl()} target="_blank" className="text-primary hover:underline">
                full legal terms and conditions
              </Link>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onDecline}
          disabled={isSubmitting}
          className="flex-1"
        >
          Decline & Go Back
        </Button>
        <Button
          onClick={onAccept}
          disabled={!allChecked || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Creating Tokenization..." : "Accept & Create Tokenization"}
        </Button>
      </div>
    </div>
  );
};

export default TokenizationTermsAcceptance;
