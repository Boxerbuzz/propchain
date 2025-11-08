import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CustomTokenSelector } from "@/components/account/CustomTokenSelector";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "sonner";
import { Send as SendIcon, ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import hederaIcon from "/hedera.svg";
import usdcIcon from "/usdc.svg";

type CardState = "main" | "selectToken";

export default function SendTokens() {
  const [cardState, setCardState] = useState<CardState>("main");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"HBAR" | "USDC">("HBAR");
  const [isSending, setIsSending] = useState(false);
  const { balance } = useWalletBalance();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to send tokens");
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

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

  const handleSend = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to send tokens");
      navigate("/auth/login");
      return;
    }

    if (!recipient || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Validate recipient address format
    if (!recipient.match(/^0\.0\.\d+$/) && !recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Invalid recipient address. Use format 0.0.xxxxx or 0x...");
      return;
    }

    setIsSending(true);

    try {
      // Check session before making the request
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error("Your session has expired. Please log in again.");
        navigate("/auth/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-tokens', {
        body: {
          recipient_address: recipient,
          token_type: selectedToken,
          amount: parsedAmount
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send tokens');
      }

      if (data?.success) {
        const hashscanUrl = `https://hashscan.io/testnet/transaction/${data.transaction_id}`;
        
        toast.success(
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Transfer Successful!</p>
            <p className="text-sm">Sent {parsedAmount} {selectedToken} to {recipient}</p>
            <a 
              href={hashscanUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View on HashScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>,
          { duration: 8000 }
        );

        // Clear form
        setRecipient("");
        setAmount("");

        // Invalidate queries to refresh balances
        queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
        queryClient.invalidateQueries({ queryKey: ['wallet-token-balances'] });
        queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      } else {
        throw new Error(data?.error || 'Transfer failed');
      }
    } catch (error: any) {
      console.error('Send error:', error);
      
      // Show user-friendly error messages
      let errorMessage = 'Failed to send tokens. Please try again.';
      if (error.message) {
        if (error.message.includes('Authentication failed') || error.message.includes('not authenticated')) {
          errorMessage = 'Your session has expired. Please log in again.';
          setTimeout(() => navigate("/auth/login"), 2000);
        } else if (error.message.includes('Insufficient')) {
          errorMessage = error.message;
        } else if (error.message.includes('Invalid recipient')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] mx-auto">
        <Tabs value="send" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="buy" onClick={() => navigate("/account/tokens/buy")}>
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" onClick={() => navigate("/account/tokens/sell")}>
              Sell
            </TabsTrigger>
            <TabsTrigger value="swap" onClick={() => navigate("/account/tokens/swap")}>
              Swap
            </TabsTrigger>
            <TabsTrigger value="send" onClick={() => navigate("/account/tokens/send")}>
              Send
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="mt-0">
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
              <Button 
                onClick={handleSend} 
                className="w-full" 
                size="lg"
                disabled={isSending || !recipient || !amount}
              >
                <SendIcon className="mr-2 h-4 w-4" />
                {isSending ? 'Sending...' : `Send ${selectedToken}`}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
