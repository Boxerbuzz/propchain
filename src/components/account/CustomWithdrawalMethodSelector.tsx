import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronRight, Building2, Wallet, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WithdrawalMethod {
  id: string;
  name: string;
  description: string;
  icon: "bank" | "hedera" | "usdc";
  fee: string;
  badge?: string;
  processingTime?: string;
}

interface CustomWithdrawalMethodSelectorProps {
  selectedMethod: WithdrawalMethod | null;
  label: string;
  onClick: () => void;
}

export function CustomWithdrawalMethodSelector({
  selectedMethod,
  label,
  onClick,
}: CustomWithdrawalMethodSelectorProps) {
  const getIcon = (icon: string) => {
    switch (icon) {
      case "bank":
        return <Building2 className="h-5 w-5" />;
      case "hedera":
        return <Wallet className="h-5 w-5" />;
      case "usdc":
        return <Coins className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Card
        className="p-4 cursor-pointer hover:bg-accent transition-colors border-2"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          {selectedMethod ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {getIcon(selectedMethod.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{selectedMethod.name}</p>
                    {selectedMethod.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedMethod.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedMethod.description}
                  </p>
                  {selectedMethod.processingTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedMethod.processingTime}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Select withdrawal method</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
