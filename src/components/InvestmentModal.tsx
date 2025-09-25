import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, ArrowRight, Wallet, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import MoneyInput from '@/components/ui/money-input';
import { useInvestmentFlow } from '@/hooks/useInvestmentFlow';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    tokenPrice: number;
    minInvestment: number;
    maxInvestment?: number;
    expectedReturn: number;
  };
  tokenizationId: string;
}

type Step = 'amount' | 'payment' | 'confirmation' | 'processing' | 'success';

const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  property,
  tokenizationId,
}) => {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState(property.minInvestment);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'wallet'>('paystack');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  
  const { createInvestment, isCreating } = useInvestmentFlow();

  // Calculate investment details
  const tokensReceived = Math.floor(amount / property.tokenPrice);
  const ownershipPercentage = (tokensReceived * property.tokenPrice) / 1000000 * 100; // Assuming 1M property value
  const projectedAnnualReturn = (amount * property.expectedReturn) / 100;
  const projectedMonthlyReturn = projectedAnnualReturn / 12;

  // Countdown timer
  useEffect(() => {
    if (step === 'payment' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (step === 'amount') setStep('payment');
    else if (step === 'payment') setStep('confirmation');
  };

  const handleInvest = async () => {
    setStep('processing');
    
    try {
      createInvestment({
        tokenizationId,
        amount,
        paymentMethod,
      });
      
      // Success handling is done in the hook
      if (paymentMethod === 'wallet') {
        setStep('success');
      }
    } catch (error) {
      console.error('Investment failed:', error);
      setStep('payment');
    }
  };

  const resetModal = () => {
    setStep('amount');
    setAmount(property.minInvestment);
    setTimeLeft(600);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getStepNumber = (currentStep: Step) => {
    const steps = ['amount', 'payment', 'confirmation', 'processing', 'success'];
    return steps.indexOf(currentStep) + 1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'success' ? 'Investment Successful!' : 'Invest in Property'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        {step !== 'success' && (
          <div className="mb-6">
            <Progress value={(getStepNumber(step) / 4) * 100} className="mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {getStepNumber(step)} of 4</span>
              {step === 'payment' && (
                <span className="text-warning">Time remaining: {formatTime(timeLeft)}</span>
              )}
            </div>
          </div>
        )}

        {/* Amount Selection Step */}
        {step === 'amount' && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="amount">Investment Amount</Label>
              <MoneyInput
                value={amount}
                onChange={setAmount}
                min={property.minInvestment}
                max={property.maxInvestment}
                className="text-lg"
                placeholder="Enter amount"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Min: ₦{property.minInvestment.toLocaleString()}
                {property.maxInvestment && ` | Max: ₦${property.maxInvestment.toLocaleString()}`}
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Tokens Received:</span>
                  <span className="font-semibold">{tokensReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ownership:</span>
                  <span className="font-semibold">{ownershipPercentage.toFixed(4)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between text-success">
                  <span>Est. Monthly Return:</span>
                  <span className="font-semibold">₦{projectedMonthlyReturn.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleNext} 
              className="w-full"
              disabled={amount < property.minInvestment}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Payment Method Step */}
        {step === 'payment' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
              <p className="text-2xl font-bold text-primary">₦{amount.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <div
                className={cn(
                  "border rounded-lg p-4 cursor-pointer transition-colors",
                  paymentMethod === 'paystack' ? "border-primary bg-primary/5" : "border-border"
                )}
                onClick={() => setPaymentMethod('paystack')}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Paystack (Card/Bank)</p>
                    <p className="text-sm text-muted-foreground">Pay with debit card or bank transfer</p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "border rounded-lg p-4 cursor-pointer transition-colors",
                  paymentMethod === 'wallet' ? "border-primary bg-primary/5" : "border-border"
                )}
                onClick={() => setPaymentMethod('wallet')}
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Wallet Balance</p>
                    <p className="text-sm text-muted-foreground">Use your account balance</p>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleNext} className="w-full">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Confirm Investment</h3>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Property:</span>
                  <span className="font-medium text-right">{property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">₦{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens:</span>
                  <span className="font-semibold">{tokensReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-success">
                  <span>Est. Monthly Return:</span>
                  <span className="font-semibold">₦{projectedMonthlyReturn.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
              By proceeding, you agree to the investment terms and understand that returns are not guaranteed.
            </div>

            <Button onClick={handleInvest} className="w-full" disabled={isCreating}>
              {isCreating ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Clock className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Processing Investment</h3>
              <p className="text-muted-foreground">Please wait while we secure your tokens...</p>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Investment Successful!</h3>
              <p className="text-muted-foreground mb-4">
                You've successfully invested ₦{amount.toLocaleString()} and received {tokensReceived.toLocaleString()} tokens.
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your estimated monthly return</p>
                  <p className="text-2xl font-bold text-success">₦{projectedMonthlyReturn.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleClose} className="w-full">
              View Portfolio
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentModal;