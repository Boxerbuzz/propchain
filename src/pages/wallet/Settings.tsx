import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Key, 
  Bell, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Download,
  Trash2,
  AlertTriangle,
  Coins,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

const WalletSettings = () => {
  const { balance, isLoading, associateUsdc, isAssociatingUsdc } = useWalletBalance();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const walletInfo = {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    network: "Ethereum Mainnet",
    created: "Dec 15, 2024",
    lastAccess: "Today at 10:30 AM"
  };

  const connectedDevices = [
    {
      id: 1,
      name: "MacBook Pro",
      location: "New York, NY",
      lastActive: "Active now",
      current: true
    },
    {
      id: 2,
      name: "iPhone 15",
      location: "New York, NY", 
      lastActive: "2 hours ago",
      current: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Wallet Settings</h1>
        <p className="text-muted-foreground">
          Manage your wallet security and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Wallet Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Wallet Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Wallet Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-muted p-2 rounded flex-1 truncate">
                    {walletInfo.address}
                  </code>
                  <Button variant="outline" size="sm">
                    Copy
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Network</Label>
                <p className="text-sm mt-1">{walletInfo.network}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm mt-1">{walletInfo.created}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Access</Label>
                <p className="text-sm mt-1">{walletInfo.lastAccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password */}
            <div className="space-y-4">
              <h3 className="font-medium">Change Password</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline"
                  disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                >
                  Update Password
                </Button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your wallet
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              {twoFactorEnabled && (
                <Button variant="outline">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Manage 2FA
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  ) : balance?.usdcAssociated ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-500">Associated</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Not Associated</span>
                    </>
                  )}
                </div>
              </div>
              
              {balance?.usdcAssociated && balance?.usdcBalance !== undefined && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">{balance.usdcBalance.toFixed(2)} USDC</p>
                </div>
              )}

              {!balance?.usdcAssociated && (
                <div className="space-y-3">
                  <Alert>
                    <AlertDescription>
                      You need to associate USDC with your wallet before you can receive or trade USDC tokens.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={() => associateUsdc()} 
                    disabled={isAssociatingUsdc}
                    className="w-full"
                  >
                    {isAssociatingUsdc ? "Associating..." : "Associate USDC Token"}
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
                  Tokens are automatically associated when you invest in properties
                </p>
              </div>
              
              {balance?.associatedTokens && balance.associatedTokens.length > 0 ? (
                <div className="space-y-2">
                  {balance.associatedTokens.map((token) => (
                    <div key={token.tokenId} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <p className="font-medium">{token.tokenName}</p>
                        <p className="text-sm text-muted-foreground">
                          {token.tokenSymbol} • {token.tokenId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{token.balance.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">tokens</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    You don't have any property tokens yet. Invest in tokenized properties to receive tokens.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive transaction and security alerts via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications on your device
                </p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Connected Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Devices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    {device.name}
                    {device.current && <Badge variant="default">Current</Badge>}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {device.location} • {device.lastActive}
                  </p>
                </div>
                {!device.current && (
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                )}
              </div>
            ))}
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
                Always keep a secure backup of your wallet. Without it, you may lose access to your funds permanently.
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
                This action cannot be undone. Make sure you have backed up your wallet before deleting.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletSettings;