import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, Smartphone, HardDrive, Key, CheckCircle, ExternalLink, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { HEDERA_WALLETS } from "@/lib/walletConnect";

const ConnectWallet = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const navigate = useNavigate();
  
  const { 
    connectExternalWallet, 
    isConnecting, 
    selectedWallet,
    connectedWallets,
    hasExternalWallet
  } = useWalletConnect();

  // Hedera wallet options
  const hederaWallets = Object.entries(HEDERA_WALLETS).map(([key, wallet]) => ({
    id: key,
    name: wallet.name,
    description: `Connect your ${wallet.name} wallet`,
    icon: wallet.icon,
    appUrl: wallet.appUrl,
    available: true
  }));

  // Other connection methods
  const otherMethods = [
    {
      id: "import",
      name: "Import Wallet",
      description: "Import existing wallet with seed phrase or private key",
      icon: Key,
      available: true
    }
  ];

  const handleConnect = async (method: string) => {
    setSelectedMethod(method);
    
    if (hederaWallets.some(w => w.id === method)) {
      // Handle Hedera wallet connection
      const result = await connectExternalWallet(method);
      if (result.success) {
        navigate("/wallet/dashboard");
      }
    } else if (method === "import") {
      // Keep existing import functionality
      if (seedPhrase || privateKey) {
        // Simulate import process
        setTimeout(() => {
          navigate("/wallet/dashboard");
        }, 2000);
      }
    }
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

      {/* Connected Wallets Status */}
      {hasExternalWallet && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            You already have a wallet connected. You can connect additional wallets or manage existing ones in the dashboard.
          </AlertDescription>
        </Alert>
      )}

      {/* Hedera Wallets Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Hedera Wallets</h2>
        <p className="text-muted-foreground mb-6">
          Connect your existing Hedera wallet for full control over your assets
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {hederaWallets.map((wallet) => {
            const isSelected = selectedMethod === wallet.id;
            const isCurrentlyConnecting = isConnecting && selectedWallet === wallet.id;
            
            return (
              <Card
                key={wallet.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? "border-primary shadow-lg" : ""
                }`}
                onClick={() => handleConnect(wallet.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <span className="text-2xl">{wallet.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {wallet.name}
                        </h3>
                        {isCurrentlyConnecting && (
                          <Badge variant="default">Connecting...</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {wallet.description}
                      </p>

                      <div className="flex items-center gap-2">
                        {!isCurrentlyConnecting && (
                          <Button variant="outline" size="sm">
                            Connect
                          </Button>
                        )}
                        
                        {wallet.appUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(wallet.appUrl, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Get Wallet
                          </Button>
                        )}
                        
                        {isCurrentlyConnecting && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <CheckCircle className="h-4 w-4" />
                            Connecting...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Other Methods Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Other Options</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {otherMethods.map((method) => {
            const IconComponent = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? "border-primary shadow-lg" : ""
                } ${!method.available ? "opacity-50" : ""}`}
                onClick={() => method.available && setSelectedMethod(method.id)}
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
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {method.description}
                      </p>

                      {method.available && (
                        <Button variant="outline" size="sm">
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedMethod === "import" && renderImportForm()}

      <Card className="mt-8 border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">
                Security Notice
              </h3>
              <p className="text-sm text-yellow-700">
                Never share your private keys, seed phrases, or passwords with anyone. 
                Our platform will never ask for this information. Always verify you're 
                on the correct website before connecting your wallet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectWallet;