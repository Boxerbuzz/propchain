import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronRight, Building2, Wallet, Coins } from "lucide-react";

interface Method {
  id: string;
  name: string;
  description: string;
  icon: "bank" | "hedera" | "usdc";
}

interface CustomMethodSelectorProps {
  selectedMethod: Method | null;
  label: string;
  onClick: () => void;
}

export function CustomMethodSelector({
  selectedMethod,
  label,
  onClick,
}: CustomMethodSelectorProps) {
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
        className="p-4 cursor-pointer hover:bg-accent transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          {selectedMethod ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  {getIcon(selectedMethod.icon)}
                </div>
                <div>
                  <p className="font-semibold">{selectedMethod.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMethod.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Select method</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
