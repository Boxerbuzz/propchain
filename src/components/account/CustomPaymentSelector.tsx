import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { CreditCard, Bank, AppleLogo, GoogleLogo } from "@phosphor-icons/react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: "card" | "bank" | "apple" | "google" | "venmo" | "paypal";
}

interface CustomPaymentSelectorProps {
  selectedMethod: PaymentMethod | null;
  label: string;
  onClick: () => void;
}

const PaymentIcon = ({ type }: { type: string }) => {
  const iconProps = { size: 24, weight: "duotone" as const };
  
  switch (type) {
    case "card":
      return <CreditCard {...iconProps} />;
    case "bank":
      return <Bank {...iconProps} />;
    case "apple":
      return <AppleLogo {...iconProps} />;
    case "google":
      return <GoogleLogo {...iconProps} />;
    case "venmo":
      return <span className="text-2xl font-bold text-[#008CFF]">V</span>;
    case "paypal":
      return <span className="text-2xl font-bold text-[#00457C]">P</span>;
    default:
      return <CreditCard {...iconProps} />;
  }
};

export function CustomPaymentSelector({
  selectedMethod,
  label,
  onClick,
}: CustomPaymentSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Card
        className="p-4 cursor-pointer hover:bg-accent transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              {selectedMethod ? (
                <PaymentIcon type={selectedMethod.icon} />
              ) : (
                <CreditCard size={24} weight="duotone" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {selectedMethod?.name || "Select method"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedMethod ? "Payment method" : "Choose how to pay"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>
    </div>
  );
}
