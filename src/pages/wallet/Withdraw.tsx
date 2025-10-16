import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Wallet,
  Building2,
  Coins,
  ArrowRight,
  Info,
  ArrowLeft,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { CurrencyAmountInput } from "@/components/CurrencyAmountInput";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export default function WithdrawPage() {
  const navigate = useNavigate();
  const { stats } = useDashboard();
  const { balance: walletBalance } = useWalletBalance();
  const balance = stats.walletBalance;

  const [selectedCurrency, setSelectedCurrency] = useState<"hbar" | "usdc">("hbar");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bank_transfer" | "hedera" | "usdc">(
    "bank_transfer"
  );
  const [loading, setLoading] = useState(false);

  // Bank transfer fields
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");

  // Hedera fields
  const [hederaAccount, setHederaAccount] = useState("");

  const processingFee = method === "bank_transfer" ? 100 : 0;
  const netAmount = Number(amount) - processingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (
      method === "bank_transfer" &&
      (!accountNumber || !accountName || !bankName)
    ) {
      toast.error("Please fill in all bank details");
      return;
    }

    if ((method === "hedera" || method === "usdc") && !hederaAccount) {
      toast.error("Please enter Hedera account ID");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "initiate-withdrawal",
        {
          body: {
            amount_ngn: Number(amount),
            currency_type: selectedCurrency,
            currency_amount: Number(amount),
            withdrawal_method: method,
            bank_details:
              method === "bank_transfer"
                ? {
                    account_number: accountNumber,
                    account_name: accountName,
                    bank_name: bankName,
                    bank_code: bankCode,
                  }
                : undefined,
            hedera_account:
              method === "hedera" || method === "usdc"
                ? hederaAccount
                : undefined,
          },
        }
      );

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully");
      navigate("/wallet/dashboard");
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error(error.message || "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/wallet/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wallet
          </Button>
          <h1 className="text-3xl font-bold">Withdraw Funds</h1>
          <p className="text-muted-foreground mt-2">
            Transfer your available balance to your preferred account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Available Balance Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Available Balance
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      ₦{balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Details</CardTitle>
              <CardDescription>
                Enter the amount and select your withdrawal method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount and Currency */}
              <div className="space-y-2">
                <Label>Select Currency and Amount</Label>
                <CurrencyAmountInput
                  currencies={[
                    {
                      id: 'hbar',
                      name: 'HBAR',
                      icon: '/hedera.svg',
                      balance: walletBalance?.balanceHbar || 0,
                      balanceNgn: walletBalance?.balanceNgn || 0,
                      color: 'purple'
                    },
                    {
                      id: 'usdc',
                      name: 'USDC',
                      icon: '/usdc.svg',
                      balance: walletBalance?.usdcBalance || 0,
                      balanceNgn: walletBalance?.usdcBalanceNgn || 0,
                      color: 'blue'
                    }
                  ]}
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                  amount={amount}
                  onAmountChange={setAmount}
                  showMaxButton={true}
                  showBalance={true}
                  placeholder="0.00"
                  error={parseFloat(amount) > (selectedCurrency === 'hbar' ? (walletBalance?.balanceHbar || 0) : (walletBalance?.usdcBalance || 0))}
                />
                <p className="text-xs text-muted-foreground">
                  Withdraw from your {selectedCurrency.toUpperCase()} balance
                </p>
              </div>

              {/* Withdrawal Method */}
              <div className="space-y-3">
                <Label className="text-base">Select Withdrawal Method</Label>
                <RadioGroup
                  value={method}
                  onValueChange={(value: any) => setMethod(value)}
                  className="gap-3"
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      method === "bank_transfer"
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <label
                      htmlFor="bank"
                      className="flex items-center p-4 cursor-pointer"
                    >
                      <RadioGroupItem
                        value="bank_transfer"
                        id="bank"
                        className="mr-3"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Bank Transfer</p>
                          <p className="text-sm text-muted-foreground">
                            ₦100 processing fee
                          </p>
                        </div>
                      </div>
                    </label>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      method === "hedera"
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <label
                      htmlFor="hedera"
                      className="flex items-center p-4 cursor-pointer"
                    >
                      <RadioGroupItem
                        value="hedera"
                        id="hedera"
                        className="mr-3"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Hedera Account</p>
                          <p className="text-sm text-muted-foreground">
                            Instant & Free
                          </p>
                        </div>
                      </div>
                    </label>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      method === "usdc"
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <label
                      htmlFor="usdc"
                      className="flex items-center p-4 cursor-pointer"
                    >
                      <RadioGroupItem value="usdc" id="usdc" className="mr-3" />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Coins className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">USDC Transfer</p>
                          <p className="text-sm text-muted-foreground">
                            Stablecoin withdrawal - Free
                          </p>
                        </div>
                      </div>
                    </label>
                  </Card>
                </RadioGroup>
              </div>

              {/* Bank Transfer Fields */}
              {method === "bank_transfer" && (
                <Card className="p-6 space-y-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Building2 className="h-4 w-4" />
                    <span>Bank Account Details</span>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input
                        id="accountName"
                        placeholder="John Doe"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Select
                        value={bankName}
                        onValueChange={setBankName}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gtbank">GTBank</SelectItem>
                          <SelectItem value="access">Access Bank</SelectItem>
                          <SelectItem value="zenith">Zenith Bank</SelectItem>
                          <SelectItem value="firstbank">First Bank</SelectItem>
                          <SelectItem value="uba">UBA</SelectItem>
                          <SelectItem value="fidelity">
                            Fidelity Bank
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              )}

              {/* Hedera/USDC Fields */}
              {(method === "hedera" || method === "usdc") && (
                <Card className="p-6 space-y-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Wallet className="h-4 w-4" />
                    <span>Hedera Account Details</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hederaAccount">Hedera Account ID</Label>
                    <Input
                      id="hederaAccount"
                      placeholder="0.0.123456"
                      value={hederaAccount}
                      onChange={(e) => setHederaAccount(e.target.value)}
                      required
                      className="h-11 font-mono"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Enter your Hedera account ID in the format 0.0.XXXXXX
                    </p>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Fee Summary */}
          {amount && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Withdrawal Amount
                    </span>
                    <span className="font-semibold text-lg">
                      ₦{Number(amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Processing Fee
                    </span>
                    <span className="font-medium text-muted-foreground">
                      -₦{processingFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">You Will Receive</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ₦{netAmount.toLocaleString()}
                      </span>
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate("/wallet/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 font-semibold"
              disabled={loading || !balance || balance <= 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
