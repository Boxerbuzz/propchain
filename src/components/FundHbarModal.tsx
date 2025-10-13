import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Wallet, CreditCard, Copy, ExternalLink, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface FundHbarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hederaAccountId?: string;
}

export default function FundHbarModal({ open, onOpenChange, hederaAccountId }: FundHbarModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"external" | "fiat">("external");
  const [loading, setLoading] = useState(false);

  // Exchange rate: 1 HBAR ≈ ₦100 (example rate, should be fetched dynamically)
  const HBAR_TO_NGN_RATE = 100;
  const hbarAmount = Number(amount) / HBAR_TO_NGN_RATE;

  const copyAddress = () => {
    if (hederaAccountId) {
      navigator.clipboard.writeText(hederaAccountId);
      toast.success("Hedera account ID copied to clipboard");
    }
  };

  const handleFiatPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) < 1000) {
      toast.error("Minimum funding amount is ₦1,000");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('initialize-paystack-payment', {
        body: {
          amount_ngn: Number(amount),
          currency: "NGN",
          payment_type: "hbar_funding",
          redirect_url: `${window.location.origin}/wallet`,
        },
      });

      if (error) throw error;

      if (data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      
      let errorMessage = 'Failed to initialize payment';
      if (error.message) {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.error || errorMessage;
        } catch {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">Fund HBAR Balance</DialogTitle>
          <DialogDescription>
            Add HBAR to your wallet via external transfer or fiat payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-3">
            <Label className="text-base">Select Funding Method</Label>
            <RadioGroup value={method} onValueChange={(value: any) => setMethod(value)} className="gap-3">
              <Card className={`cursor-pointer transition-all ${method === 'external' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <label htmlFor="external" className="flex items-center p-4 cursor-pointer">
                  <RadioGroupItem value="external" id="external" className="mr-3" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">External Transfer</p>
                      <p className="text-sm text-muted-foreground">Send HBAR from another wallet</p>
                    </div>
                  </div>
                </label>
              </Card>

              <Card className={`cursor-pointer transition-all ${method === 'fiat' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <label htmlFor="fiat" className="flex items-center p-4 cursor-pointer">
                  <RadioGroupItem value="fiat" id="fiat" className="mr-3" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Pay with Naira</p>
                      <p className="text-sm text-muted-foreground">Buy HBAR with card or bank transfer</p>
                    </div>
                  </div>
                </label>
              </Card>
            </RadioGroup>
          </div>

          {/* External Transfer Instructions */}
          {method === "external" && (
            <Card className="p-6 space-y-4 bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wallet className="h-4 w-4" />
                <span>Your Hedera Account</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <code className="text-sm font-mono">{hederaAccountId || "Not available"}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    disabled={!hederaAccountId}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Send HBAR to this account from any Hedera wallet (HashPack, Blade, etc.)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Funds will appear in your balance after network confirmation (~3-5 seconds)</span>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('https://hashscan.io/testnet', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on HashScan
                </Button>
              </div>
            </Card>
          )}

          {/* Fiat Payment Form */}
          {method === "fiat" && (
            <Card className="p-6 space-y-4 bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="h-4 w-4" />
                <span>Payment Details</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount in Naira"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1000"
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">Minimum: ₦1,000</p>
                </div>

                {amount && Number(amount) >= 1000 && (
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">You will receive</span>
                        <span className="text-lg font-bold text-primary">
                          ~{hbarAmount.toFixed(2)} HBAR
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Rate: ₦{HBAR_TO_NGN_RATE.toLocaleString()} per HBAR
                      </p>
                    </div>
                  </Card>
                )}

                <Button
                  onClick={handleFiatPayment}
                  disabled={loading || !amount || Number(amount) < 1000}
                  className="w-full h-11 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-start gap-2">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>You'll be redirected to Paystack for secure payment</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>HBAR will be credited to your account after payment confirmation</span>
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
