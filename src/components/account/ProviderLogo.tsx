import moonpayLogo from "@/assets/moonpay.svg";
import transakLogo from "@/assets/transak.svg";
import rampLogo from "@/assets/ramp-network.svg";
import pangolinLogo from "@/assets/pangolin.svg";
import saucerswapLogo from "@/assets/saucerswap.webp";

interface ProviderLogoProps {
  provider: string;
  size?: "sm" | "md" | "lg";
}

export function ProviderLogo({ provider, size = "md" }: ProviderLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const className = sizeClasses[size];

  switch (provider) {
    case 'moonpay':
      return <img src={moonpayLogo} alt="MoonPay" className={className} />;
    case 'transak':
      return <img src={transakLogo} alt="Transak" className={className} />;
    case 'ramp':
      return <img src={rampLogo} alt="Ramp Network" className={className} />;
    case 'pangolin':
      return <img src={pangolinLogo} alt="Pangolin" className={className} />;
    case 'saucerswap':
      return <img src={saucerswapLogo} alt="SaucerSwap" className={className} />;
    default:
      return <span className="text-2xl">?</span>;
  }
}
