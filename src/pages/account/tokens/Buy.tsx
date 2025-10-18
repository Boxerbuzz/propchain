import { TokenSwapCard } from "@/components/account/TokenSwapCard";

export default function BuyTokens() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Buy Tokens</h1>
          <p className="text-muted-foreground">
            Purchase HBAR or USDC with your preferred payment method
          </p>
        </div>
        
        <TokenSwapCard defaultTab="buy" />
      </div>
    </div>
  );
}
