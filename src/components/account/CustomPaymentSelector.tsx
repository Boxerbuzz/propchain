import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import {
  CreditCardIcon,
  BankIcon,
  AppleLogoIcon,
} from "@phosphor-icons/react";
import venmoIcon from "@/assets/payment-methods/venmo-dark.png";
import achIcon from "@/assets/payment-methods/ach@3x.png";
import paypalIcon from "@/assets/payment-methods/paypal@3x.png";
import visaIcon from "@/assets/payment-methods/visa@3x.png";
import mastercardIcon from "@/assets/payment-methods/mastercard@3x.png";
import revoltIcon from "@/assets/payment-methods/revolt.png";
import paypalLogo from "@/assets/paypal.svg";
import googlePayLogo from "@/assets/google-pay.svg";
import venmoLogo from "@/assets/venmo-icon.svg";

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
      return <CreditCardIcon {...iconProps} />;
    case "bank":
      return <BankIcon {...iconProps} />;
    case "apple":
      return <AppleLogoIcon {...iconProps} />;
    case "google":
      return <img src={googlePayLogo} alt="Google Pay" className="w-10 h-10" />;
    case "venmo":
      return (
        <img
          src={venmoLogo}
          alt="Venmo"
          className="w-10 h-10 rounded-full m-1"
        />
      );
    case "paypal":
      return <img src={paypalLogo} alt="PayPal" className="w-10 h-10" />;
    default:
      return <CreditCardIcon {...iconProps} />;
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
          <div className="w-full">
            <div className="flex items-center justify-between w-full border-b">
              <div className="flex items-center gap-3 pb-2 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  {selectedMethod ? (
                    <PaymentIcon type={selectedMethod.icon} />
                  ) : (
                    <CreditCardIcon size={24} weight="duotone" />
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

            {/* Accepted Payment Methods */}
            <div className="flex items-center gap-2 mt-1 pt-3">
              <div className="flex items-center gap-2 flex-wrap w-full justify-end">
                <img
                  src={venmoIcon}
                  alt="Venmo"
                  className="h-4 w-auto opacity-60"
                />
                <img
                  src={achIcon}
                  alt="ACH"
                  className="h-4 w-auto opacity-60"
                />
                <img
                  src={paypalIcon}
                  alt="PayPal"
                  className="h-4 w-auto opacity-60"
                />
                <img
                  src={visaIcon}
                  alt="Visa"
                  className="h-4 w-auto opacity-60"
                />
                <img
                  src={mastercardIcon}
                  alt="Mastercard"
                  className="h-4 w-auto opacity-60"
                />
                <img
                  src={revoltIcon}
                  alt="Revolt"
                  className="h-4 w-auto opacity-60"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
