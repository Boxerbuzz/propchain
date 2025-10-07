import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}

export default function WithdrawalModal({ open, onOpenChange, balance, onSuccess }: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bank_transfer" | "hedera" | "usdc">("bank_transfer");
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

    if (method === "bank_transfer" && (!accountNumber || !accountName || !bankName)) {
      toast.error("Please fill in all bank details");
      return;
    }

    if ((method === "hedera" || method === "usdc") && !hederaAccount) {
      toast.error("Please enter Hedera account ID");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('initiate-withdrawal', {
        body: {
          amount_ngn: Number(amount),
          withdrawal_method: method,
          bank_details: method === "bank_transfer" ? {
            account_number: accountNumber,
            account_name: accountName,
            bank_name: bankName,
            bank_code: bankCode,
          } : undefined,
          hedera_account: (method === "hedera" || method === "usdc") ? hederaAccount : undefined,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available Balance */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={balance}
              required
            />
          </div>

          {/* Withdrawal Method */}
          <div className="space-y-2">
            <Label>Withdrawal Method</Label>
            <RadioGroup value={method} onValueChange={(value: any) => setMethod(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank" />
                <Label htmlFor="bank" className="font-normal cursor-pointer">
                  Bank Transfer (₦100 fee)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hedera" id="hedera" />
                <Label htmlFor="hedera" className="font-normal cursor-pointer">
                  Hedera Account (Free)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="usdc" id="usdc" />
                <Label htmlFor="usdc" className="font-normal cursor-pointer">
                  USDC Transfer (Free)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Bank Transfer Fields */}
          {method === "bank_transfer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select value={bankName} onValueChange={setBankName} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
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
            </>
          )}

          {/* Hedera/USDC Fields */}
          {(method === "hedera" || method === "usdc") && (
            <div className="space-y-2">
              <Label htmlFor="hederaAccount">Hedera Account ID</Label>
              <Input
                id="hederaAccount"
                placeholder="0.0.123456"
                value={hederaAccount}
                onChange={(e) => setHederaAccount(e.target.value)}
                required
              />
            </div>
          )}

          {/* Fee Summary */}
          {amount && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Processing Fee:</span>
                <span>₦{processingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>You Will Receive:</span>
                <span>₦{netAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
