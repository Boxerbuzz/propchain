import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Calculator,
  Info,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import MoneyInput from "@/components/ui/money-input";
import { useInvestmentFlow } from "@/hooks/useInvestmentFlow";
import InvestmentProgressIndicator from "./InvestmentProgressIndicator";
import { useHederaAccount } from "@/hooks/useHederaAccount";

interface InvestmentModalProps {
  tokenization: {
    id: string;
    token_name?: string;
    token_symbol?: string;
    price_per_token: number;
    min_investment: number;
    max_investment?: number;
    expected_roi_annual?: number;
    properties?: {
      id: string;
      title: string;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const investmentFormSchema = z.object({
  amount: z.number().min(1, "Investment amount is required"),
});

type InvestmentFormData = z.infer<typeof investmentFormSchema>;

export default function InvestmentModal({ tokenization, open, onOpenChange }: InvestmentModalProps) {
  const { createInvestment, isCreating, error } = useInvestmentFlow();
  const { hasAccount, createAccount, isCreating: isCreatingAccount } = useHederaAccount();
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet">("paystack");
  const [showProgress, setShowProgress] = useState(false);
  const [investmentStatus, setInvestmentStatus] = useState<{
    paymentStatus: 'pending' | 'processing' | 'confirmed' | 'failed';
    tokenTransferStatus?: 'pending' | 'processing' | 'completed' | 'failed';
    chatRoomCreated?: boolean;
  }>({
    paymentStatus: 'pending'
  });

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      amount: tokenization.min_investment,
    },
  });

  const watchedAmount = form.watch("amount");

  const calculateTokens = (amount: number) => {
    if (!amount || !tokenization.price_per_token) return 0;
    return Math.floor(amount / tokenization.price_per_token);
  };

  const calculateROI = (amount: number) => {
    if (!amount || !tokenization.expected_roi_annual) return { monthly: 0, annual: 0 };
    const annual = (amount * tokenization.expected_roi_annual) / 100;
    return {
      annual,
      monthly: annual / 12,
    };
  };

  const tokens = calculateTokens(watchedAmount);
  const roi = calculateROI(watchedAmount);

  const handleAmountChange = (value: number) => {
    form.setValue("amount", value);
  };

  const resetForm = () => {
    form.reset();
    setPaymentMethod("paystack");
    setShowProgress(false);
    setInvestmentStatus({ paymentStatus: 'pending' });
  };

  const handleInvest = async (values: InvestmentFormData) => {
    if (!hasAccount) {
      toast.error('Please create a blockchain wallet first');
      return;
    }

    setShowProgress(true);
    setInvestmentStatus({ paymentStatus: 'processing' });
    
    createInvestment({
      tokenizationId: tokenization.id,
      amount: values.amount,
      paymentMethod,
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Invest in {tokenization.properties?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Purchase tokenized shares of this premium property
            </DialogDescription>
          </DialogHeader>

          {!hasAccount && (
            <Alert className="mb-4">
              <Wallet className="h-4 w-4" />
              <AlertTitle>Blockchain Wallet Required</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>You need a blockchain wallet to receive your tokens.</p>
                <Button 
                  onClick={() => createAccount()} 
                  disabled={isCreatingAccount}
                  size="sm"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isCreatingAccount ? 'Creating...' : 'Create Wallet'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {showProgress && (
            <InvestmentProgressIndicator
              paymentMethod={paymentMethod}
              paymentStatus={investmentStatus.paymentStatus}
              tokenTransferStatus={investmentStatus.tokenTransferStatus}
              chatRoomCreated={investmentStatus.chatRoomCreated}
            />
          )}

          <form onSubmit={form.handleSubmit(handleInvest)} className="space-y-6">
            {/* Token Information */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Token Symbol</p>
                    <Badge variant="secondary" className="mt-1">
                      {tokenization.token_symbol || 'N/A'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Price per Token</p>
                    <p className="text-lg font-semibold">
                      ₦{tokenization.price_per_token.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount</Label>
              <MoneyInput
                value={watchedAmount}
                onChange={handleAmountChange}
                min={tokenization.min_investment}
                max={tokenization.max_investment}
                placeholder="Enter investment amount"
                className="text-lg"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Min: ₦{tokenization.min_investment.toLocaleString()}</span>
                {tokenization.max_investment && (
                  <span>Max: ₦{tokenization.max_investment.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Investment Calculator */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens to receive</p>
                    <p className="text-xl font-bold">{tokens.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. monthly return</p>
                    <p className="text-xl font-bold text-green-600">₦{roi.monthly.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "paystack" | "wallet") => setPaymentMethod(value)}
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="paystack" id="paystack" />
                  <CreditCard className="w-5 h-5" />
                  <div className="flex-1">
                    <Label htmlFor="paystack" className="font-medium">
                      Paystack Payment
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Pay with debit card or bank transfer
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Wallet className="w-5 h-5" />
                  <div className="flex-1">
                    <Label htmlFor="wallet" className="font-medium">
                      Wallet Balance
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use your account balance
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Investment Summary */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tokens to receive:</span>
                  <span className="font-semibold">{tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total investment:</span>
                  <span className="font-semibold">₦{watchedAmount.toLocaleString()}</span>
                </div>
                {roi.monthly > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Est. monthly return:</span>
                      <span className="font-semibold">₦{roi.monthly.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Est. annual return:</span>
                      <span className="font-semibold">₦{roi.annual.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Risk Warning */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Real estate investments carry inherent risks. Past performance does not guarantee future results. 
                Please invest only what you can afford to lose.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || watchedAmount < tokenization.min_investment || !hasAccount}
                className="flex-1"
              >
                {isCreating ? (
                  "Processing..."
                ) : (
                  <>
                    Invest ₦{watchedAmount.toLocaleString()}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
}