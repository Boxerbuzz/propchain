import { useState } from "react";
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
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const InvestmentFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Mock property data - in real app, this would come from API
  const property = {
    id,
    title: "Luxury Downtown Apartment Complex",
    location: "Manhattan, NY",
    price: "$2,500,000",
    expectedReturn: "8.5%",
    tokenPrice: 100,
    minInvestment: 1000,
    totalTokens: 25000,
    availableTokens: 15000,
  };

  const calculateTokens = () => {
    const amount = parseFloat(investmentAmount) || 0;
    return Math.floor(amount / property.tokenPrice);
  };

  const handleInvest = () => {
    if (step === 1) {
      if (
        !investmentAmount ||
        parseFloat(investmentAmount) < property.minInvestment
      ) {
        toast({
          title: "Invalid Amount",
          description: `Minimum investment is $${property.minInvestment}`,
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!paymentMethod) {
        toast({
          title: "Payment Method Required",
          description: "Please select a payment method",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    } else {
      // Process investment
      toast({
        title: "Investment Successful!",
        description: `You've invested $${investmentAmount} in ${property.title}`,
      });
      navigate("/portfolio");
    }
  };

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
                      <Label htmlFor="amount">Investment Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="text-lg"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Minimum investment: ${property.minInvestment}
                      </p>
                    </div>

                    {investmentAmount && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Investment Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Investment Amount:</span>
                            <span className="font-medium">
                              ${investmentAmount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tokens to Receive:</span>
                            <span className="font-medium">
                              {calculateTokens()} tokens
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Token Price:</span>
                            <span className="font-medium">
                              ${property.tokenPrice}
                            </span>
                          </div>
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
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setPaymentMethod("card")}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <div>
                            <h4 className="font-medium">Credit/Debit Card</h4>
                            <p className="text-sm text-muted-foreground">
                              Pay instantly with your card
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
                            <h4 className="font-medium">Digital Wallet</h4>
                            <p className="text-sm text-muted-foreground">
                              Pay with your connected wallet
                            </p>
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
                          <span className="font-medium">{property.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Investment Amount:</span>
                          <span className="font-medium">
                            ${investmentAmount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tokens:</span>
                          <span className="font-medium">
                            {calculateTokens()} tokens
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-medium capitalize">
                            {paymentMethod}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Investment:</span>
                          <span>${investmentAmount}</span>
                        </div>
                      </div>
                    </div>

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
                  <Button onClick={handleInvest} className="flex-1">
                    {step === 3 ? "Confirm Investment" : "Continue"}
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
                  <h4 className="font-medium">{property.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {property.location}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Property Value:</span>
                    <span className="font-medium">{property.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expected Return:</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {property.expectedReturn}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Token Price:</span>
                    <span className="font-medium">${property.tokenPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available Tokens:</span>
                    <span className="font-medium">
                      {property.availableTokens.toLocaleString()}
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
