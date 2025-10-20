import { TokenSwapCard } from "@/components/account/TokenSwapCard";

export default function SwapTokens() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <TokenSwapCard defaultTab="swap" />
      </div>
    </div>
  );
}
