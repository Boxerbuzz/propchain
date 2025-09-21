import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Copy, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const CreateWallet = () => {
  const [step, setStep] = useState(1);
  const [walletName, setWalletName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [seedPhrase] = useState([
    "abandon", "ability", "able", "about", "above", "absent",
    "absorb", "abstract", "absurd", "abuse", "access", "accident"
  ]);
  const [verificationWords, setVerificationWords] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateWallet = async () => {
    setIsCreating(true);
    // Simulate wallet creation
    setTimeout(() => {
      setIsCreating(false);
      setStep(2);
    }, 2000);
  };

  const handleSeedVerification = () => {
    if (verificationWords.length === 3) {
      setStep(4);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Create New Wallet
        </h2>
        <p className="text-muted-foreground">
          Set up a secure wallet for your real estate investments
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your wallet will be encrypted and stored securely. Never share your private keys or seed phrase.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="walletName">Wallet Name</Label>
          <Input
            id="walletName"
            placeholder="My Investment Wallet"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <Button
        onClick={handleCreateWallet}
        disabled={!walletName || !password || password !== confirmPassword || isCreating}
        className="w-full"
      >
        {isCreating ? "Creating Wallet..." : "Create Wallet"}
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Backup Your Seed Phrase
        </h2>
        <p className="text-muted-foreground">
          Write down these 12 words in order. Keep them safe and never share them.
        </p>
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          This is the ONLY way to recover your wallet. Store it securely offline.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {seedPhrase.map((word, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Badge variant="outline" className="text-xs">
                {index + 1}
              </Badge>
              <span className="font-mono">{word}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Copy className="h-4 w-4 mr-2" />
          Copy to Clipboard
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1">
          I've Saved It
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Verify Seed Phrase
        </h2>
        <p className="text-muted-foreground">
          Select the words in the correct order to verify your backup
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {["abandon", "ability", "access", "about", "above", "accident"].map((word) => (
            <Button
              key={word}
              variant="outline"
              size="sm"
              onClick={() => {
                if (verificationWords.length < 3) {
                  setVerificationWords([...verificationWords, word]);
                }
              }}
              disabled={verificationWords.includes(word)}
            >
              {word}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Selected Words:</Label>
          <div className="flex gap-2">
            {verificationWords.map((word, index) => (
              <Badge key={index} variant="default">
                {index + 1}. {word}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setVerificationWords([])}>
          Clear
        </Button>
        <Button 
          onClick={handleSeedVerification}
          disabled={verificationWords.length !== 3}
          className="flex-1"
        >
          Verify
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Wallet Created Successfully!
        </h2>
        <p className="text-muted-foreground">
          Your wallet "{walletName}" is ready for use
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wallet Address:</span>
            <code className="text-sm">0x1234...5678</code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span>Ethereum Mainnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance:</span>
            <span>$0.00 USD</span>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/wallet/fund")}>
          Fund Wallet
        </Button>
        <Button onClick={() => navigate("/wallet/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create Wallet</CardTitle>
            <Badge variant="outline">Step {step} of 4</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWallet;