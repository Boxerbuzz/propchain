import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Info,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useInvestmentFlow } from "@/hooks/useInvestmentFlow";
import InvestmentProgressIndicator from "./InvestmentProgressIndicator";
import { useHederaAccount } from "@/hooks/useHederaAccount";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import ModernInvestmentInput from "./ModernInvestmentInput";

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
  tokenCount: z.number().min(1, "Token count is required").optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type InvestmentFormData = z.infer<typeof investmentFormSchema>;

export default function InvestmentModal({
  tokenization,
  open,
  onOpenChange,
}: InvestmentModalProps) {
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;
  const { createInvestment, isCreating, error } = useInvestmentFlow();
  const {
    hasAccount,
    createAccount,
    isCreating: isCreatingAccount,
  } = useHederaAccount();
  const { balance: walletBalance, isLoading: isLoadingBalance } =
    useWalletBalance();
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet">(
    "paystack"
  );
  const [showProgress, setShowProgress] = useState(false);
  const [investmentStatus, setInvestmentStatus] = useState<{
    paymentStatus: "pending" | "processing" | "confirmed" | "failed";
    tokenTransferStatus?: "pending" | "processing" | "completed" | "failed";
    chatRoomCreated?: boolean;
  }>({
    paymentStatus: "pending",
  });

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      amount: tokenization.min_investment,
      tokenCount: Math.floor(
        tokenization.min_investment / tokenization.price_per_token
      ),
      acceptTerms: false,
    },
  });

  const watchedAmount = form.watch("amount");
  const watchedTokenCount = form.watch("tokenCount");

  const calculateTokens = (amount: number) => {
    if (!amount || !tokenization.price_per_token) return 0;
    return Math.floor(amount / tokenization.price_per_token);
  };

  const calculateAmount = (tokenCount: number) => {
    if (!tokenCount || !tokenization.price_per_token) return 0;
    return tokenCount * tokenization.price_per_token;
  };

  const calculateROI = (amount: number) => {
    if (!amount || !tokenization.expected_roi_annual)
      return { monthly: 0, annual: 0 };
    const annual = (amount * tokenization.expected_roi_annual) / 100;
    return {
      annual,
      monthly: annual / 12,
    };
  };

  const currentAmount = watchedAmount;
  const currentTokenCount = watchedTokenCount || calculateTokens(watchedAmount);
  const roi = calculateROI(currentAmount);

  const handleAmountChange = (value: number) => {
    form.setValue("amount", value);
    form.setValue("tokenCount", calculateTokens(value));
  };

  const handleTokenCountChange = (value: number) => {
    form.setValue("tokenCount", value);
    form.setValue("amount", calculateAmount(value));
  };

  const resetForm = () => {
    form.reset({
      amount: tokenization.min_investment,
      tokenCount: Math.floor(
        tokenization.min_investment / tokenization.price_per_token
      ),
      acceptTerms: false,
    });
    setPaymentMethod("paystack");
    setShowProgress(false);
    setInvestmentStatus({ paymentStatus: "pending" });
  };

  const handleInvest = async (values: InvestmentFormData) => {
    if (!hasAccount) {
      toast.error("Please create a blockchain wallet first");
      return;
    }

    setShowProgress(true);
    setInvestmentStatus({ paymentStatus: "processing" });
    
    createInvestment({
      tokenizationId: tokenization.id,
      amount: currentAmount,
      paymentMethod,
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const InvestmentForm = ({ className }: { className?: string }) => (
    <form onSubmit={form.handleSubmit(handleInvest)} className={`space-y-6 ${className || ''}`}>
      {/* Token Information */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Token Symbol</p>
              <Badge variant="secondary" className="mt-1">
                {tokenization.token_symbol}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Price per Token
              </p>
              <p className="text-lg font-semibold">
                ₦{tokenization.price_per_token.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern Investment Input */}
      <ModernInvestmentInput
        amount={currentAmount}
        tokenCount={currentTokenCount}
        tokenSymbol={tokenization.token_symbol || ""}
        pricePerToken={tokenization.price_per_token}
        minInvestment={tokenization.min_investment}
        maxInvestment={tokenization.max_investment}
        walletBalance={walletBalance?.balanceNgn || 0}
        onAmountChange={handleAmountChange}
        onTokenCountChange={handleTokenCountChange}
      />

      {/* Investment Calculator */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Tokens to receive
              </p>
              <p className="text-xl font-bold">
                {currentTokenCount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Est. monthly return
              </p>
              <p className="text-xl font-bold text-green-600">
                ₦{roi.monthly.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        <div className="grid gap-3">
          <div
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
              paymentMethod === "paystack"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setPaymentMethod("paystack")}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                paymentMethod === "paystack"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <Label className="font-medium cursor-pointer">
                Paystack Payment
              </Label>
              <p className="text-sm text-muted-foreground">
                Pay with debit card or bank transfer
              </p>
            </div>
          </div>

          <div
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
              paymentMethod === "wallet"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setPaymentMethod("wallet")}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                paymentMethod === "wallet"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <Label className="font-medium cursor-pointer">
                Wallet Balance
              </Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Use your account balance
                </p>
                <div className="text-right">
                  {isLoadingBalance ? (
                    <p className="text-sm text-muted-foreground">
                      Loading...
                    </p>
                  ) : walletBalance ? (
                    <div>
                      <p className="text-sm font-medium">
                        ₦{walletBalance.balanceNgn?.toLocaleString() || "0"}
                      </p>
                      {walletBalance.balanceHbar > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {walletBalance.balanceHbar.toFixed(4)} HBAR
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No balance
                    </p>
                  )}
                </div>
              </div>
              {paymentMethod === "wallet" &&
                walletBalance &&
                currentAmount > (walletBalance.balanceNgn || 0) && (
                  <p className="text-xs text-destructive mt-1">
                    Insufficient balance. Top up your wallet to continue.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Tokens to receive:</span>
            <span className="font-semibold">
              {currentTokenCount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Total investment:</span>
            <span className="font-semibold">
              ₦{currentAmount.toLocaleString()}
            </span>
          </div>
          {roi.monthly > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm">Est. monthly return:</span>
                <span className="font-semibold">
                  ₦{roi.monthly.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm">Est. annual return:</span>
                <span className="font-semibold">
                  ₦{roi.annual.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="acceptTerms"
          checked={form.watch("acceptTerms")}
          onCheckedChange={(checked) =>
            form.setValue("acceptTerms", !!checked)
          }
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I accept the terms and conditions
          </Label>
          <p className="text-xs text-muted-foreground">
            By investing, you agree to our{" "}
            <a
              href="/legal/terms-of-service"
              className="underline hover:text-foreground"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/legal/risk-disclosure"
              className="underline hover:text-foreground"
            >
              Risk Disclosure
            </a>
            .
          </p>
        </div>
      </div>
      {form.formState.errors.acceptTerms && (
        <p className="text-sm text-destructive">
          {form.formState.errors.acceptTerms.message}
        </p>
      )}

      {/* Wallet Balance Warning */}
      {paymentMethod === "wallet" &&
        walletBalance &&
        currentAmount > (walletBalance.balanceNgn || 0) && (
          <Alert variant="destructive">
            <Wallet className="h-4 w-4" />
            <AlertTitle>Insufficient Balance</AlertTitle>
            <AlertDescription>
              Your wallet balance is ₦
              {(walletBalance.balanceNgn || 0).toLocaleString()}, but you're
              trying to invest ₦{currentAmount.toLocaleString()}. Please top
              up your wallet or reduce your investment amount.
            </AlertDescription>
          </Alert>
        )}

      {/* Risk Warning */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Real estate investments carry inherent risks. Past performance
          does not guarantee future results. Please invest only what you can
          afford to lose.
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
          disabled={
            isCreating ||
            currentAmount < tokenization.min_investment ||
            !hasAccount ||
            !form.watch("acceptTerms") ||
            (paymentMethod === "wallet" &&
              walletBalance &&
              currentAmount > (walletBalance.balanceNgn || 0))
          }
          className="flex-1"
        >
          {isCreating ? (
            "Processing..."
          ) : (
            <>
              Invest ₦{currentAmount.toLocaleString()}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
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
                  {isCreatingAccount ? "Creating..." : "Create Wallet"}
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

          <InvestmentForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Invest in {tokenization.properties?.title}</span>
          </DrawerTitle>
          <DrawerDescription>
            Purchase tokenized shares of this premium property
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
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
                  {isCreatingAccount ? "Creating..." : "Create Wallet"}
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

          <InvestmentForm />
            </div>
      </DrawerContent>
    </Drawer>
  );
}