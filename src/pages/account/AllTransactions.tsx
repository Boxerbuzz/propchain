import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getActivityIcon, renderStatusBadge } from "@/lib/activityIcons";

export default function AllTransactions() {
  const navigate = useNavigate();
  const { transactions: allTransactions, isLoading } = useWalletTransactions();

  const displayTransactions = (allTransactions || [])
    .map((tx) => ({
      id: tx.id,
      type: tx.displayType,
      originalType: tx.type,
      status: tx.status === "completed" ? "completed" : tx.status === "failed" ? "failed" : "pending",
      token: tx.currency || "HBAR",
      amount: tx.amount || 0,
      to: tx.to || (tx.displayType === "send" ? "Sent" : undefined),
      from: tx.from || (tx.displayType === "receive" ? "Received" : undefined),
      timestamp: tx.timestamp,
      hash: tx.hash || tx.reference || tx.explorerUrl || "",
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              ← Back
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading transactions...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {displayTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {displayTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      if (tx.hash) {
                        window.open(`https://hashscan.io/testnet/transaction/${tx.hash}`, "_blank");
                      }
                    }}
                    className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_140px_180px] items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-700">
                        {(() => {
                          const Icon = getActivityIcon(tx.type);
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {renderStatusBadge(tx.status)}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium capitalize">{tx.originalType.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.type === "send"
                          ? tx.to && tx.to !== "Sent" ? `To: ${tx.to.slice(0, 4)}...${tx.to.slice(-4)}` : 'Sent'
                          : tx.from && tx.from !== "Received" ? `From: ${tx.from.slice(0, 4)}...${tx.from.slice(-4)}` : 'Received'}
                      </p>
                    </div>

                    <div className="hidden sm:block text-center">
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === "receive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "receive" ? "+" : "-"}
                        {tx.amount} {tx.token}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
