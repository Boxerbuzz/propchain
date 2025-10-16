import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Wallet,
  CreditCard,
  Copy,
  ExternalLink,
  Info,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { CurrencyAmountInput } from "./CurrencyAmountInput";

interface FundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hederaAccountId?: string;
  usdcAssociated?: boolean;
}

export default function FundWalletModal({
  open,
  onOpenChange,
  hederaAccountId,
  usdcAssociated = false,
}: FundWalletModalProps) {
  const { user } = useAuth();
  const { associateUsdc, isAssociatingUsdc } = useWalletBalance();
  const [selectedCurrency, setSelectedCurrency] = useState<"hbar" | "usdc">(
    "hbar"
  );
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"external" | "fiat">("external");
  const [loading, setLoading] = useState(false);

  // Exchange rates (should be fetched dynamically in production)
  const HBAR_TO_NGN_RATE = 262; // ~$0.05 HBAR * 5,240 NGN/USD
  const USDC_TO_NGN_RATE = 1465; // 1:1 USD peg * 1,465 NGN/USD

  const cryptoAmount =
    selectedCurrency === "hbar"
      ? Number(amount) / HBAR_TO_NGN_RATE
      : Number(amount) / USDC_TO_NGN_RATE;
  const exchangeRate =
    selectedCurrency === "hbar" ? HBAR_TO_NGN_RATE : USDC_TO_NGN_RATE;

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
      const { data, error } = await supabase.functions.invoke(
        "initialize-paystack-payment",
        {
          body: {
            amount_ngn: Number(amount),
            currency: "NGN",
            payment_type:
              selectedCurrency === "hbar" ? "hbar_funding" : "usdc_funding",
            currency_type: selectedCurrency,
            redirect_url: `${window.location.origin}/wallet/dashboard`,
          },
        }
      );

      if (error) throw error;

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error);

      let errorMessage = "Failed to initialize payment";
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">Fund Wallet</DialogTitle>
          <DialogDescription>
            Add HBAR or USDC to your wallet via external transfer or fiat
            payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* USDC Association Check */}
          {selectedCurrency === "usdc" && !usdcAssociated && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>USDC is not associated with your account yet.</p>
                <Button
                  onClick={() => associateUsdc()}
                  disabled={isAssociatingUsdc}
                  size="sm"
                  variant="outline"
                >
                  {isAssociatingUsdc ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Associating...
                    </>
                  ) : (
                    "Associate USDC Now"
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Method Selection */}
          <div className="space-y-3">
            <Label className="text-base">Select Funding Method</Label>
            <RadioGroup
              value={method}
              onValueChange={(value: any) => setMethod(value)}
              className="gap-3"
            >
              <Card
                className={`cursor-pointer transition-all ${
                  method === "external"
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <label
                  htmlFor="external"
                  className="flex items-center p-4 cursor-pointer"
                >
                  <RadioGroupItem
                    value="external"
                    id="external"
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">External Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        Send {selectedCurrency.toUpperCase()} from another
                        wallet
                      </p>
                    </div>
                  </div>
                </label>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  method === "fiat"
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <label
                  htmlFor="fiat"
                  className="flex items-center p-4 cursor-pointer"
                >
                  <RadioGroupItem value="fiat" id="fiat" className="mr-3" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Pay with Naira</p>
                      <p className="text-sm text-muted-foreground">
                        Buy {selectedCurrency.toUpperCase()} with card or bank
                        transfer
                      </p>
                    </div>
                  </div>
                </label>
              </Card>
            </RadioGroup>
          </div>

          {/* External Transfer Instructions */}
          {method === "external" && (
            <Card className="p-6 space-y-4 bg-muted/30">
              <div className="space-y-3 mb-4">
                <Label>Select Currency to Receive</Label>
                <CurrencyAmountInput
                  currencies={[
                    {
                      id: "hbar",
                      name: "HBAR",
                      icon: "/hedera.svg",
                      balance: 0,
                      balanceNgn: 0,
                      color: "purple",
                    },
                    {
                      id: "usdc",
                      name: "USDC",
                      icon: "/usdc.svg",
                      balance: 0,
                      balanceNgn: 0,
                      color: "blue",
                    },
                  ]}
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                  amount=""
                  onAmountChange={() => {}}
                  showMaxButton={false}
                  showBalance={false}
                  placeholder="Currency selection only"
                  disabled={true}
                />
              </div>

              <div className="flex items-center gap-2 text-sm font-medium">
                <Wallet className="h-4 w-4" />
                <span>Your Hedera Account</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <code className="text-sm font-mono">
                    {hederaAccountId || "Not available"}
                  </code>
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
                  <p className="flex items-start gap-2 text-muted-foreground text-xs">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Send {selectedCurrency.toUpperCase()} to this account from
                      any Hedera wallet (HashPack, Blade, etc.)
                    </span>
                  </p>
                  {selectedCurrency === "usdc" && !usdcAssociated && (
                    <p className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Please associate USDC first before receiving external
                        transfers
                      </span>
                    </p>
                  )}
                  <p className="flex items-start gap-2 text-muted-foreground text-xs">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Funds will appear in your balance after network
                      confirmation (~3-5 seconds)
                    </span>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      "https://hashscan.io/testnet/account/" + hederaAccountId,
                      "_blank"
                    )
                  }
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
                  <Label>Amount in Naira</Label>
                  <CurrencyAmountInput
                    currencies={[
                      {
                        id: "hbar",
                        name: "HBAR",
                        icon: "/hedera.svg",
                        balance: 0,
                        balanceNgn: HBAR_TO_NGN_RATE,
                        color: "purple",
                      },
                      {
                        id: "usdc",
                        name: "USDC",
                        icon: "/usdc.svg",
                        balance: 0,
                        balanceNgn: USDC_TO_NGN_RATE,
                        color: "blue",
                      },
                    ]}
                    selectedCurrency={selectedCurrency}
                    onCurrencyChange={setSelectedCurrency}
                    amount={amount}
                    onAmountChange={setAmount}
                    showMaxButton={false}
                    showBalance={false}
                    placeholder="1,000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: ₦1,000
                  </p>
                </div>

                {amount && Number(amount) >= 1000 && (
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          You will receive
                        </span>
                        <span className="text-lg font-bold text-primary">
                          ~
                          {cryptoAmount.toFixed(
                            selectedCurrency === "hbar" ? 2 : 6
                          )}{" "}
                          {selectedCurrency.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Rate: ₦{exchangeRate.toLocaleString()} per{" "}
                        {selectedCurrency.toUpperCase()}
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
                    <span>
                      You'll be redirected to Paystack for secure payment
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      {selectedCurrency.toUpperCase()} will be credited to your
                      account after payment confirmation
                    </span>
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
