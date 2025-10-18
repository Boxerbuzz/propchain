import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TokenSelector } from "@/components/account/TokenSelector";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "sonner";
import { Send as SendIcon } from "lucide-react";

export default function SendTokens() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"HBAR" | "USDC">("HBAR");
  const { balance } = useWalletBalance();

  const tokens = [
    {
      symbol: "HBAR",
      name: "Hedera",
      icon: "ℏ",
      balance: balance?.balanceHbar || 0,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: "💵",
      balance: balance?.usdcBalance || 0,
    },
  ];

  const handleSend = () => {
    if (!recipient || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    // Mock send transaction
    toast.success(`Sent ${amount} ${selectedToken} to ${recipient}`);
    setRecipient("");
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Send Tokens</h1>
          <p className="text-muted-foreground">
            Transfer HBAR or USDC to another wallet
          </p>
        </div>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-6">
            {/* Recipient Address */}
            <div className="space-y-2">
              <Label>Recipient Address</Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0.0.12345 or 0x..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter a Hedera account ID (0.0.xxxxx) or EVM address
              </p>
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
              <Label>Token</Label>
              <TokenSelector
                selectedToken={selectedToken}
                onSelectToken={(token) => setSelectedToken(token as "HBAR" | "USDC")}
                tokens={tokens}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => {
                    const token = tokens.find((t) => t.symbol === selectedToken);
                    if (token) setAmount(token.balance.toString());
                  }}
                >
                  Max
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Available: {tokens.find((t) => t.symbol === selectedToken)?.balance.toFixed(4)} {selectedToken}
              </p>
            </div>

            {/* Gas Fee Estimate */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Estimated gas fee</span>
                <span className="font-semibold">~0.001 HBAR</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">
                  {amount ? parseFloat(amount).toFixed(4) : "0.00"} {selectedToken}
                </span>
              </div>
            </div>

            {/* Send Button */}
            <Button onClick={handleSend} className="w-full" size="lg">
              <SendIcon className="mr-2 h-4 w-4" />
              Send {selectedToken}
            </Button>
          </div>
        </Card>

        {/* Transaction History */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="text-center text-muted-foreground py-8">
            <p>No recent transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

