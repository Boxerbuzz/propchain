import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Wallet, Building2, ArrowRight, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import CurrencySelector from "./CurrencySelector";

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: {
    hbar: number;
    hbarNgn: number;
    usdc: number;
    usdcNgn: number;
  };
  onSuccess: () => void;
}

export default function WithdrawalModal({ open, onOpenChange, balance, onSuccess }: WithdrawalModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<"hbar" | "usdc">("hbar");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bank_transfer" | "hedera">("bank_transfer");
  const [loading, setLoading] = useState(false);

  // Bank transfer fields
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");

  // Hedera fields
  const [hederaAccount, setHederaAccount] = useState("");

  const currentBalance = selectedCurrency === "hbar" ? balance.hbar : balance.usdc;
  const currentBalanceNgn = selectedCurrency === "hbar" ? balance.hbarNgn : balance.usdcNgn;
  const processingFee = method === "bank_transfer" ? 100 : 0;
  
  // For crypto amount entry
  const amountInNgn = Number(amount) * (currentBalanceNgn / currentBalance);
  const netAmountNgn = amountInNgn - processingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) > currentBalance) {
      toast.error(`Insufficient ${selectedCurrency.toUpperCase()} balance`);
      return;
    }

    if (method === "bank_transfer" && (!accountNumber || !accountName || !bankName)) {
      toast.error("Please fill in all bank details");
      return;
    }

    if (method === "hedera" && !hederaAccount) {
      toast.error("Please enter Hedera account ID");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('initiate-withdrawal', {
        body: {
          amount_ngn: amountInNgn,
          currency_type: selectedCurrency,
          currency_amount: Number(amount),
          withdrawal_method: method,
          bank_details: method === "bank_transfer" ? {
            account_number: accountNumber,
            account_name: accountName,
            bank_name: bankName,
            bank_code: bankCode,
          } : undefined,
          hedera_account: method === "hedera" ? hederaAccount : undefined,
        },
      });

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully");
      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      setBankName("");
      setBankCode("");
      setHederaAccount("");
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">Withdraw Funds</DialogTitle>
          <p className="text-sm text-muted-foreground">Transfer your available balance to your preferred account</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Currency Selection */}
          <div className="space-y-3">
            <Label className="text-base">Select Currency to Withdraw</Label>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
              hbarBalance={balance.hbar}
              hbarBalanceNgn={balance.hbarNgn}
              usdcBalance={balance.usdc}
              usdcBalanceNgn={balance.usdcNgn}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount ({selectedCurrency === "hbar" ? "ℏ" : "USDC"})
            </Label>
            <Input
              id="amount"
              type="number"
              step={selectedCurrency === "hbar" ? "0.0001" : "0.01"}
              placeholder={`Enter amount in ${selectedCurrency.toUpperCase()}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={selectedCurrency === "hbar" ? "0.0001" : "0.01"}
              max={currentBalance}
              required
            />
            {amount && (
              <p className="text-sm text-muted-foreground">
                ≈ ₦{amountInNgn.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          {/* Withdrawal Method */}
          <div className="space-y-3">
            <Label className="text-base">Select Withdrawal Method</Label>
            <RadioGroup value={method} onValueChange={(value: any) => setMethod(value)} className="gap-3">
              <Card className={`cursor-pointer transition-all ${method === 'bank_transfer' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <label htmlFor="bank" className="flex items-center p-4 cursor-pointer">
                  <RadioGroupItem value="bank_transfer" id="bank" className="mr-3" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        Convert {selectedCurrency.toUpperCase()} to NGN (₦100 fee)
                      </p>
                    </div>
                  </div>
                </label>
              </Card>

              <Card className={`cursor-pointer transition-all ${method === 'hedera' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <label htmlFor="hedera" className="flex items-center p-4 cursor-pointer">
                  <RadioGroupItem value="hedera" id="hedera" className="mr-3" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Hedera Account</p>
                      <p className="text-sm text-muted-foreground">
                        Send {selectedCurrency.toUpperCase()} directly - Free & Instant
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
                  <Select value={bankName} onValueChange={setBankName} required>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gtbank">GTBank</SelectItem>
                      <SelectItem value="access">Access Bank</SelectItem>
                      <SelectItem value="zenith">Zenith Bank</SelectItem>
                      <SelectItem value="firstbank">First Bank</SelectItem>
                      <SelectItem value="uba">UBA</SelectItem>
                      <SelectItem value="fidelity">Fidelity Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Hedera Fields */}
          {method === "hedera" && (
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

          {/* Fee Summary */}
          {amount && (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Withdrawal Amount</span>
                  <span className="font-semibold text-lg">
                    {Number(amount).toFixed(selectedCurrency === "hbar" ? 4 : 2)}{" "}
                    {selectedCurrency.toUpperCase()}
                  </span>
                </div>
                {method === "bank_transfer" && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Converted to NGN</span>
                      <span className="font-medium">
                        ≈ ₦{amountInNgn.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Processing Fee</span>
                      <span className="font-medium text-muted-foreground">
                        -₦{processingFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px bg-border"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">You Will Receive</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ₦{netAmountNgn.toLocaleString()}
                        </span>
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </>
                )}
                {method === "hedera" && (
                  <>
                    <div className="h-px bg-border"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">You Will Receive</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {Number(amount).toFixed(selectedCurrency === "hbar" ? 4 : 2)}{" "}
                          {selectedCurrency.toUpperCase()}
                        </span>
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {selectedCurrency.toUpperCase()} will be sent directly to the specified Hedera account
                    </p>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-12" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 font-semibold" 
              disabled={loading}
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
      </DialogContent>
    </Dialog>
  );
}
