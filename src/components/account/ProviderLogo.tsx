import moonpayLogo from "@/assets/moonpay.svg";
import moonpayLogoLight from "@/assets/light/moonpay.svg";
import transakLogo from "@/assets/transak.svg";
import rampLogo from "@/assets/ramp-network.svg";
import rampLogoLight from "@/assets/light/ramp-network.svg";
import pangolinLogo from "@/assets/pangolin.svg";
import saucerswapLogo from "@/assets/saucerswap.webp";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ProviderLogoProps {
  provider: string;
  size?: "sm" | "md" | "lg";
}

export function ProviderLogo({ provider, size = "md" }: ProviderLogoProps) {
  const { isDark } = useAppTheme();
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const className = sizeClasses[size];

  switch (provider) {
    case "moonpay":
      return (
        <img
          src={isDark ? moonpayLogo : moonpayLogoLight}
          alt="MoonPay"
          className={className}
        />
      );
    case "transak":
      return <img src={transakLogo} alt="Transak" className={className} />;
    case "ramp":
      return (
        <img
          src={isDark ? rampLogo : rampLogoLight}
          alt="Ramp Network"
          className={className}
        />
      );
    case "pangolin":
      return <img src={pangolinLogo} alt="Pangolin" className={className} />;
    case "saucerswap":
      return (
        <div className="flex items-center gap-2">
          <img src={saucerswapLogo} alt="SaucerSwap" className={className} />
          <h4 className="text-xl font-medium">
            Saucer<span className="text-xl text-green-500">Swap</span>
          </h4>
        </div>
      );
    default:
      return <span className="text-2xl">?</span>;
  }
}
