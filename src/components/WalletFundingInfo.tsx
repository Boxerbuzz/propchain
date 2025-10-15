import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WalletFundingInfo = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem("walletFundingWarning_dismissed");
    if (dismissedUntil) {
      const dismissDate = new Date(dismissedUntil);
      if (dismissDate > new Date()) {
        setDismissed(true);
      } else {
        localStorage.removeItem("walletFundingWarning_dismissed");
      }
    }
  }, []);

  const handleDismiss = () => {
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 7); // Dismiss for 7 days
    localStorage.setItem("walletFundingWarning_dismissed", dismissUntil.toISOString());
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 mb-6">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            <span className="font-semibold">Important:</span> Only fund your wallet with{" "}
            <span className="font-semibold">HBAR</span> or{" "}
            <span className="font-semibold">USDC</span>. Other tokens are not currently supported
            and may result in loss of funds.
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-auto p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex-shrink-0"
        >
          <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </Button>
      </div>
    </Alert>
  );
};
