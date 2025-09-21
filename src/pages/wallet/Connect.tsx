import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, Smartphone, HardDrive, Key, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConnectWallet = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const navigate = useNavigate();

  const connectionMethods = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect using MetaMask browser extension",
      icon: Wallet,
      available: true
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Connect using mobile wallet via QR code",
      icon: Smartphone,
      available: true
    },
    {
      id: "hardware",
      name: "Hardware Wallet",
      description: "Connect Ledger or Trezor device",
      icon: HardDrive,
      available: false
    },
    {
      id: "import",
      name: "Import Wallet",
      description: "Import existing wallet with seed phrase or private key",
      icon: Key,
      available: true
    }
  ];

  const handleConnect = async (method: string) => {
    setIsConnecting(true);
    setSelectedMethod(method);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      navigate("/wallet/dashboard");
    }, 2000);
  };

  const handleImportWallet = () => {
    if (seedPhrase || privateKey) {
      handleConnect("import");
    }
  };

  const renderImportForm = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Import Existing Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="seedPhrase">Seed Phrase (12 words)</Label>
          <textarea
            id="seedPhrase"
            placeholder="Enter your 12-word seed phrase separated by spaces"
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            className="w-full min-h-[100px] p-3 border border-input bg-background rounded-md resize-none"
          />
        </div>

        <div className="text-center text-muted-foreground">
          OR
        </div>

        <div>
          <Label htmlFor="privateKey">Private Key</Label>
          <Input
            id="privateKey"
            type="password"
            placeholder="Enter your private key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
        </div>

        <Button
          onClick={handleImportWallet}
          disabled={!seedPhrase && !privateKey || isConnecting}
          className="w-full"
        >
          {isConnecting ? "Importing..." : "Import Wallet"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Connect Wallet</h1>
        <p className="text-muted-foreground">
          Choose how you'd like to connect your wallet to start investing
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {connectionMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? "border-primary shadow-lg" : ""
              } ${!method.available ? "opacity-50" : ""}`}
              onClick={() => method.available && handleConnect(method.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {method.name}
                      </h3>
                      {!method.available && (
                        <Badge variant="secondary">Coming Soon</Badge>
                      )}
                      {isSelected && isConnecting && (
                        <Badge variant="default">Connecting...</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {method.description}
                    </p>

                    {method.available && !isConnecting && (
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    )}
                    
                    {isConnecting && isSelected && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle className="h-4 w-4" />
                        Connecting...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedMethod === "import" && renderImportForm()}

      <Card className="mt-8 border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Security Notice
          </h3>
          <p className="text-sm text-yellow-700">
            Never share your private keys, seed phrases, or passwords with anyone. 
            Our platform will never ask for this information. Always verify you're 
            on the correct website before connecting your wallet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectWallet;