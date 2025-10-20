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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex-shrink-0">
              {selectedMethod ? (
                <PaymentIcon type={selectedMethod.icon} />
              ) : (
                <CreditCard size={24} weight="duotone" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">
                {selectedMethod?.name || "Select method"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {selectedMethod ? "Payment method" : "Choose how to pay"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </Card>
    </div>
  );
}
