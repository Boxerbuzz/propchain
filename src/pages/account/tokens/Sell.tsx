import { TokenSwapCard } from "@/components/account/TokenSwapCard";

export default function SellTokens() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Sell Tokens</h1>
          <p className="text-muted-foreground">
            Convert your HBAR or USDC to fiat currency
          </p>
        </div>
        
        <TokenSwapCard defaultTab="sell" />
      </div>
    </div>
  );
}
