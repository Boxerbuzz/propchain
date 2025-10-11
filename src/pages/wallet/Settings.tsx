import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Trash2,
  AlertTriangle,
  Coins,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useNavigate } from "react-router-dom";

const WalletSettings = () => {
  const { balance, isLoading, associateUsdc, isAssociatingUsdc } =
    useWalletBalance();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Wallet Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your wallet security and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Token Association Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Token Association
            </CardTitle>
            <CardDescription>
              Manage your associated tokens for trading and transfers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* USDC Association Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">USDC Token</Label>
                  <p className="text-sm text-muted-foreground">
                    Token ID: 0.0.429274 (Hedera Testnet)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  ) : balance?.usdcAssociated ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-500">
                        Associated
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-medium text-destructive">
                        Not Associated
                      </span>
                    </>
                  )}
                </div>
              </div>

              {balance?.usdcAssociated &&
                balance?.usdcBalance !== undefined && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">
                      Current Balance
                    </p>
                    <p className="text-2xl font-bold">
                      {balance.usdcBalance.toFixed(2)} USDC
                    </p>
                  </div>
                )}

              {!balance?.usdcAssociated && (
                <div className="space-y-3">
                  <Alert>
                    <AlertDescription>
                      You need to associate USDC with your wallet before you can
                      receive or trade USDC tokens.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => associateUsdc()}
                    disabled={isAssociatingUsdc}
                    className="w-full"
                  >
                    {isAssociatingUsdc
                      ? "Associating..."
                      : "Associate USDC Token"}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Associated Property Tokens */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Property Tokens</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Tokens are automatically associated when you invest in
                  properties
                </p>
              </div>

              {balance?.associatedTokens &&
              balance.associatedTokens.length > 0 ? (
                <div className="space-y-2">
                  {balance.associatedTokens.map((token) => (
                    <div
                      key={token.tokenId}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{token.tokenName}</p>
                        <p className="text-sm text-muted-foreground">
                          {token.tokenSymbol} • {token.tokenId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {token.balance.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">tokens</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    You don't have any property tokens yet. Invest in tokenized
                    properties to receive tokens.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Backup & Recovery */}
        <Card>
          <CardHeader>
            <CardTitle>Backup & Recovery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Always keep a secure backup of your wallet. Without it, you may
                lose access to your funds permanently.
              </AlertDescription>
            </Alert>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Wallet Backup
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-600">Delete Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this wallet from your device
                </p>
              </div>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Wallet
              </Button>
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                This action cannot be undone. Make sure you have backed up your
                wallet before deleting.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletSettings;
