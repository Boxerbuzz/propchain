import { WalletOperationsCard } from "@/components/account/WalletOperationsCard";

export default function WithdrawFunds() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <WalletOperationsCard defaultTab="withdraw" />
      </div>
    </div>
  );
}
