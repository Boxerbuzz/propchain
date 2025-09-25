import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";
import InvestmentModal from "@/components/InvestmentModal";
import MoneyInput from '@/components/ui/money-input';

interface InvestmentCalculatorProps {
  propertyValue: number;
  expectedReturn: number;
  tokenPrice: number;
  minimumInvestment: number;
}

export default function InvestmentCalculator({
  propertyValue,
  expectedReturn,
  tokenPrice,
  minimumInvestment,
  property
}: InvestmentCalculatorProps & { property?: any }) {
  const [investmentAmount, setInvestmentAmount] = useState(minimumInvestment);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const tokensReceived = Math.floor(investmentAmount / tokenPrice);
  const ownershipPercentage = (investmentAmount / propertyValue) * 100;
  const annualReturn = (investmentAmount * expectedReturn) / 100;
  const monthlyReturn = annualReturn / 12;

  return (
    <div className="calculator-widget">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Investment Calculator</h3>
      </div>

      <div className="space-y-4">
        {/* Investment Amount Input */}
        <div>
          <Label htmlFor="investment-amount" className="text-sm font-medium">
            Investment Amount
          </Label>
          <MoneyInput
            value={investmentAmount}
            onChange={setInvestmentAmount}
            min={minimumInvestment}
            placeholder="Enter investment amount"
            className="text-lg font-semibold"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum investment: ₦{minimumInvestment.toLocaleString()}
          </p>
        </div>

        {/* Calculations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tokens</span>
            </div>
            <p className="text-xl font-bold text-foreground">{tokensReceived}</p>
            <p className="text-xs text-muted-foreground">
              @ ₦{tokenPrice.toLocaleString()} each
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ownership</span>
            </div>
            <p className="text-xl font-bold text-foreground">{ownershipPercentage.toFixed(3)}%</p>
            <p className="text-xs text-muted-foreground">of property</p>
          </div>
        </div>

        {/* Returns */}
        <div className="bg-success/5 border border-success/20 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3">Expected Returns</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monthly</span>
              <span className="font-semibold text-success">₦{monthlyReturn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Annual</span>
              <span className="font-semibold text-success">₦{annualReturn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-success/20">
              <span className="text-sm font-medium">ROI</span>
              <span className="font-bold text-success">{expectedReturn}% p.a.</span>
            </div>
          </div>
        </div>

        {/* Investment Button */}
        <Button 
          className="w-full btn-primary" 
          size="lg"
          onClick={() => setIsModalOpen(true)}
        >
          Invest ₦{investmentAmount.toLocaleString()}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          * Returns are projected and not guaranteed
        </p>
      </div>
      
      <InvestmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        tokenization={{
          id: property?.tokenizations?.[0]?.id || '',
          token_name: property?.title || '',
          token_symbol: `${property?.title?.slice(0, 3).toUpperCase()}T` || 'PROP',
          price_per_token: tokenPrice,
          min_investment: minimumInvestment,
          max_investment: undefined,
          expected_roi_annual: expectedReturn,
          properties: {
            id: property?.id || '',
            title: property?.title || ''
          }
        }}
      />
    </div>
  );
}