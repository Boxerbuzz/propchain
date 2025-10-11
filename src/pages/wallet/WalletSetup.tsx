import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Wallet,
  Shield,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useHederaAccount } from "@/hooks/useHederaAccount";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { HEDERA_WALLETS } from "@/lib/walletConnect";

export default function WalletSetup() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { createAccount, isCreating, hasAccount } = useHederaAccount();
  const { connectExternalWallet, isConnecting, connectedWallets } =
    useWalletConnect();

  const handleConnect = async (method: string) => {
    setSelectedMethod(method);

    if (method === "custodial") {
      createAccount();
    } else {
      // External wallet connection
      const result = await connectExternalWallet(method);
      if (result) {
        // Redirect to main dashboard after successful connection
        navigate("/dashboard");
      }
    }
  };

  const isExternalWalletConnected = connectedWallets.some(
    (w) => w.type === "external"
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Success Alert */}
        {(hasAccount || isExternalWalletConnected) && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              {hasAccount && "Custodial wallet created successfully! "}
              {isExternalWalletConnected &&
                "External wallet connected successfully! "}
              You can now start investing in real estate properties.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Set Up Your Wallet
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you want to manage your investments. Create a new
            custodial wallet for easy management, or connect your existing
            Hedera wallet for full control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Custodial Wallet Option */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">PropChain Wallet</CardTitle>
              <CardDescription>
                Perfect for beginners - we handle the security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Easy setup in seconds</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Managed security and backups</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Automatic token management</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>No seed phrases to manage</span>
                </div>
              </div>

              <Button
                onClick={() => handleConnect("custodial")}
                disabled={isCreating || hasAccount}
                className="w-full"
              >
                {isCreating && selectedMethod === "custodial" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Wallet...
                  </>
                ) : hasAccount ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Wallet Created
                  </>
                ) : (
                  "Create Wallet"
                )}
              </Button>

              {hasAccount && (
                <div className="text-center pt-2">
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Wallets Option */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Connect External Wallet</CardTitle>
              <CardDescription>
                For experienced users who prefer full control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>You control your private keys</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Compatible with Hedera wallets</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Advanced security features</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Use existing wallet balance</span>
                </div>
              </div>

              {/* Available Wallets */}
              <div className="space-y-2">
                {Object.entries(HEDERA_WALLETS).map(([key, wallet]) => (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => handleConnect(key)}
                    disabled={isConnecting}
                    className="w-full justify-start text-sm"
                  >
                    <span className="mr-2">{wallet.icon}</span>
                    {isConnecting && selectedMethod === key ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      wallet.name
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Privacy Section */}
        <Card className="bg-muted/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Bank-Level Security</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    End-to-end encryption
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Multi-signature protection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Regular security audits
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Privacy First</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Your data stays private
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    No sharing with third parties
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    GDPR compliant
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Need help choosing? We're here to assist you.
          </p>
          <Link to="/support">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
