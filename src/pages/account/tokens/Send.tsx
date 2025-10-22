import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomTokenSelector } from "@/components/account/CustomTokenSelector";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "sonner";
import { Send as SendIcon, ArrowLeft } from "lucide-react";
import hederaIcon from "/hedera.svg";
import usdcIcon from "/usdc.svg";

type CardState = "main" | "selectToken";

export default function SendTokens() {
  const [cardState, setCardState] = useState<CardState>("main");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"HBAR" | "USDC">("HBAR");
  const { balance } = useWalletBalance();

  const tokens = [
    {
      symbol: "HBAR",
      name: "Hedera",
      icon: <img src={hederaIcon} alt="Hedera" className="w-10 h-10" />,
      balance: balance?.balanceHbar || 0,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: <img src={usdcIcon} alt="USDC" className="w-10 h-10" />,
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

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] mx-auto">
        <Card className="p-6 bg-card border-border">
          {/* Back Button */}
          {cardState !== "main" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCardState("main")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {/* Main View */}
          {cardState === "main" && (
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
              <CustomTokenSelector
                selectedToken={selectedTokenData || null}
                label="Token"
                showBalance={true}
                onClick={() => setCardState("selectToken")}
              />

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
                      const token = tokens.find(
                        (t) => t.symbol === selectedToken
                      );
                      if (token) setAmount(token.balance.toString());
                    }}
                  >
                    Max
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Available:{" "}
                  {tokens
                    .find((t) => t.symbol === selectedToken)
                    ?.balance.toFixed(4)}{" "}
                  {selectedToken}
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
                    {amount ? parseFloat(amount).toFixed(4) : "0.00"}{" "}
                    {selectedToken}
                  </span>
                </div>
              </div>

              {/* Send Button */}
              <Button onClick={handleSend} className="w-full" size="lg">
                <SendIcon className="mr-2 h-4 w-4" />
                Send {selectedToken}
              </Button>
            </div>
          )}

          {/* Token Selection View */}
          {cardState === "selectToken" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-2">Select Token</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose which token to send
              </p>
              {tokens.map((token) => (
                <Card
                  key={token.symbol}
                  className="p-4 cursor-pointer hover:bg-accent hover:border-primary/50 transition-all border-2"
                  onClick={() => {
                    setSelectedToken(token.symbol as "HBAR" | "USDC");
                    setCardState("main");
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        {token.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-base">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="font-semibold">{token.balance.toFixed(4)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
