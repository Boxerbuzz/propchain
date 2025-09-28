import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  TrendingUp,
  Shield,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useInvestmentFlow } from "@/hooks/useInvestmentFlow";
import { useHederaAccount } from "@/hooks/useHederaAccount";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { supabase } from "@/integrations/supabase/client";

interface Tokenization {
  id: string;
  token_name?: string;
  token_symbol?: string;
  price_per_token: number;
  min_investment: number;
  max_investment?: number;
  expected_roi_annual?: number;
  investment_window_start: string;
  investment_window_end: string;
  current_raise: number;
  target_raise?: number;
  tokens_sold: number;
  total_supply: number;
  properties?: {
    id: string;
    title: string;
    location: any;
    estimated_value: number;
  };
}

const InvestmentFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet">("paystack");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [tokenization, setTokenization] = useState<Tokenization | null>(null);
  const [loading, setLoading] = useState(true);

  const { createInvestment, isCreating, error } = useInvestmentFlow();
  const {
    hasAccount,
    createAccount,
    isCreating: isCreatingAccount,
  } = useHederaAccount();
  const { balance: walletBalance, isLoading: isLoadingBalance } = useWalletBalance();

  useEffect(() => {
    const fetchTokenization = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tokenizations")
          .select(`
            *,
            properties!inner(
              id,
              title,
              location,
              estimated_value
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setTokenization(data);
      } catch (error) {
        console.error("Error fetching tokenization:", error);
        toast.error("Failed to load investment opportunity");
        navigate("/browse-properties");
      } finally {
        setLoading(false);
      }
    };

    fetchTokenization();
  }, [id, navigate]);

  const calculateTokens = () => {
    if (!tokenization) return 0;
    const amount = parseFloat(investmentAmount) || 0;
    return Math.floor(amount / tokenization.price_per_token);
  };

  const calculateROI = () => {
    if (!tokenization || !investmentAmount) return { monthly: 0, annual: 0 };
    const amount = parseFloat(investmentAmount);
    const annual = (amount * (tokenization.expected_roi_annual || 0)) / 100;
    return {
      annual,
      monthly: annual / 12,
    };
  };

  const handleInvest = () => {
    if (!tokenization) return;

    if (step === 1) {
      const amount = parseFloat(investmentAmount);
      if (!amount || amount < tokenization.min_investment) {
        toast.error(`Minimum investment is ₦${tokenization.min_investment.toLocaleString()}`);
        return;
      }
      if (tokenization.max_investment && amount > tokenization.max_investment) {
        toast.error(`Maximum investment is ₦${tokenization.max_investment.toLocaleString()}`);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }
      setStep(3);
    } else {
      // Process investment
      if (!hasAccount) {
        toast.error("Please create a blockchain wallet first");
        return;
      }

      if (!acceptTerms) {
        toast.error("Please accept the terms and conditions");
        return;
      }

      if (paymentMethod === "wallet" && walletBalance) {
        const amount = parseFloat(investmentAmount);
        if (amount > (walletBalance.balanceNgn || 0)) {
          toast.error("Insufficient wallet balance");
          return;
        }
      }

      const tokensRequested = calculateTokens();
      createInvestment({
        tokenization_id: tokenization.id,
        amount_ngn: parseFloat(investmentAmount),
        tokens_requested: tokensRequested,
        payment_method: paymentMethod,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!tokenization) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Investment Opportunity Not Found</h1>
            <Button onClick={() => navigate("/browse-properties")}>
              Browse Properties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tokens = calculateTokens();
  const roi = calculateROI();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invest in Property</h1>
            <p className="text-muted-foreground">
              Complete your investment in 3 simple steps
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Investment Flow */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      stepNum <= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-16 h-0.5 ${
                        stepNum < step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Investment Amount"}
                  {step === 2 && "Payment Method"}
                  {step === 3 && "Confirm Investment"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Enter the amount you'd like to invest"}
                  {step === 2 && "Choose your preferred payment method"}
                  {step === 3 && "Review and confirm your investment details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                        <Label htmlFor="amount">Investment Amount (₦)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                            ₦
                          </span>
                          <Input
                            id="amount"
                            type="text"
                            placeholder="0"
                            value={investmentAmount ? parseFloat(investmentAmount).toLocaleString() : ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '');
                              setInvestmentAmount(value);
                            }}
                            className="text-lg pl-8"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Minimum investment: ₦{tokenization.min_investment.toLocaleString()}
                        </p>
                    </div>

                    {investmentAmount && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Investment Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Investment Amount:</span>
                            <span className="font-medium">
                              ₦{parseFloat(investmentAmount || '0').toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tokens to Receive:</span>
                            <span className="font-medium">
                              {tokens.toLocaleString()} tokens
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Token Price:</span>
                            <span className="font-medium">
                              ₦{tokenization.price_per_token.toLocaleString()}
                            </span>
                          </div>
                          {roi.monthly > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Est. Monthly Return:</span>
                              <span className="font-medium">
                                ₦{roi.monthly.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          paymentMethod === "paystack"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setPaymentMethod("paystack")}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <div>
                            <h4 className="font-medium">Paystack Payment</h4>
                            <p className="text-sm text-muted-foreground">
                              Pay with debit card or bank transfer
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          paymentMethod === "wallet"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setPaymentMethod("wallet")}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="h-5 w-5" />
                          <div>
                            <h4 className="font-medium">Wallet Balance</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">
                                Use your account balance
                              </p>
                              <div className="text-right ml-4">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-6 rounded-lg">
                      <h4 className="font-medium mb-4">
                        Investment Confirmation
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Property:</span>
                          <span className="font-medium">{tokenization.properties?.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Investment Amount:</span>
                          <span className="font-medium">
                            ₦{parseFloat(investmentAmount || '0').toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tokens:</span>
                          <span className="font-medium">
                            {tokens.toLocaleString()} tokens
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-medium capitalize">
                            {paymentMethod === "paystack" ? "Paystack" : "Wallet"}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Investment:</span>
                          <span>₦{parseFloat(investmentAmount || '0').toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {!hasAccount && (
                      <Alert>
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

                    {paymentMethod === "wallet" && walletBalance && 
                     parseFloat(investmentAmount) > (walletBalance.balanceNgn || 0) && (
                      <Alert variant="destructive">
                        <Wallet className="h-4 w-4" />
                        <AlertTitle>Insufficient Balance</AlertTitle>
                        <AlertDescription>
                          Your wallet balance is ₦
                          {(walletBalance.balanceNgn || 0).toLocaleString()}, but you're
                          trying to invest ₦{parseFloat(investmentAmount).toLocaleString()}. 
                          Please top up your wallet or reduce your investment amount.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(!!checked)}
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

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Real estate investments carry inherent risks. Past performance
                        does not guarantee future results. Please invest only what you can
                        afford to lose.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <div className="flex gap-2">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">
                            Investment Protection
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-200">
                            Your investment is secured by blockchain technology
                            and protected by our insurance policy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)}>
                      Back
                    </Button>
                  )}
                  <Button 
                    onClick={handleInvest} 
                    className="flex-1"
                    disabled={
                      isCreating ||
                      (step === 3 && (
                        !hasAccount ||
                        !acceptTerms ||
                        (paymentMethod === "wallet" && walletBalance && 
                         parseFloat(investmentAmount) > (walletBalance.balanceNgn || 0))
                      ))
                    }
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      step === 3 ? "Confirm Investment" : "Continue"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Summary Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{tokenization.properties?.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {tokenization.properties?.location?.city}, {tokenization.properties?.location?.state}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Property Value:</span>
                    <span className="font-medium">₦{tokenization.properties?.estimated_value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expected Return:</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {tokenization.expected_roi_annual || 0}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Token Price:</span>
                    <span className="font-medium">₦{tokenization.price_per_token.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available Tokens:</span>
                    <span className="font-medium">
                      {(tokenization.total_supply - tokenization.tokens_sold).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Funding Progress:</span>
                    <span className="font-medium">
                      {Math.round((tokenization.current_raise / (tokenization.target_raise || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Investment processed instantly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secured by blockchain</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentFlow;
