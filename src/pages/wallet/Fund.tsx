import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Banknote, ArrowDownToLine, Copy, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FundWallet = () => {
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);

  const walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

  const currencies = [
    { code: "USD", name: "US Dollar", rate: 1 },
    { code: "ETH", name: "Ethereum", rate: 0.0003 },
    { code: "BTC", name: "Bitcoin", rate: 0.000015 }
  ];

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Instant funding with 3.5% fee",
      icon: CreditCard,
      fees: "3.5%",
      time: "Instant"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      description: "Low-cost funding via ACH transfer",
      icon: Banknote,
      fees: "$0.25",
      time: "1-3 days"
    }
  ];

  const handleDeposit = async () => {
    setIsProcessing(true);
    // Simulate deposit process
    setTimeout(() => {
      setIsProcessing(false);
      // Show success message or redirect
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Fund Wallet</h1>
        <p className="text-muted-foreground">
          Add funds to your wallet to start investing in real estate
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="fiat" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fiat">Fiat Currency</TabsTrigger>
              <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            </TabsList>

            <TabsContent value="fiat" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Deposit Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-full p-2 border border-input bg-background rounded-md"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Payment Method</Label>
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <Card key={method.id} className="cursor-pointer hover:bg-accent transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{method.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {method.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">{method.fees}</Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {method.time}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Button
                    onClick={handleDeposit}
                    disabled={!depositAmount || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? "Processing..." : `Deposit $${depositAmount || "0.00"}`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownToLine className="h-5 w-5" />
                    Receive Cryptocurrency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertDescription>
                      Send only Ethereum (ETH) or ERC-20 tokens to this address. 
                      Sending other cryptocurrencies may result in permanent loss.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center space-y-4">
                    <div className="p-8 bg-muted rounded-lg">
                      <QrCode className="h-32 w-32 mx-auto text-muted-foreground" />
                    </div>
                    
                    <div>
                      <Label>Wallet Address</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={walletAddress}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(walletAddress)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Supported Tokens:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {["ETH", "USDC", "USDT", "DAI"].map((token) => (
                        <Badge key={token} variant="outline" className="justify-center">
                          {token}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">$0.00</div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>USD Balance:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>ETH Balance:</span>
                  <span>0.000 ETH</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No transactions yet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FundWallet;