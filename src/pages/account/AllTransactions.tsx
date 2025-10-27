import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import {
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeftIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AllTransactions() {
  const navigate = useNavigate();
  const { transactions: allTransactions, isLoading } = useWalletTransactions();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
      case "investment":
      case "withdrawal":
      case "token_withdrawal":
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      case "receive":
      case "dividend":
      case "deposit":
      case "token_deposit":
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      default:
        return <ArrowUpRight className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const displayTransactions = (allTransactions || [])
    .map((tx) => {
      let simpleType: "send" | "receive";
      if (
        tx.type === "investment" ||
        tx.type === "withdrawal" ||
        tx.type === "token_withdrawal"
      ) {
        simpleType = "send";
      } else {
        simpleType = "receive";
      }

      const status =
        tx.status === "completed"
          ? "completed"
          : tx.status === "failed"
          ? "failed"
          : "pending";

      let details = "";
      if (tx.type === "investment") {
        details = tx.description || "Investment";
      } else if (tx.type === "dividend") {
        details = tx.description || "Dividend";
      } else if (tx.type === "withdrawal") {
        details = tx.description || "Bank account";
      } else if (tx.type === "deposit" || tx.type === "token_deposit") {
        details = tx.description || "Received";
      } else {
        details = tx.description || "";
      }

      return {
        id: tx.id,
        type: simpleType,
        status,
        token: tx.currency || "HBAR",
        amount: tx.amount || 0,
        to: simpleType === "send" ? details : undefined,
        from: simpleType === "receive" ? details : undefined,
        timestamp: tx.timestamp,
        hash: tx.hash || tx.reference || tx.explorerUrl || "",
      };
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
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
                        window.open(
                          `https://hashscan.io/testnet/transaction/${tx.hash}`,
                          "_blank"
                        );
                      }
                    }}
                    className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_140px_180px] items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-700">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5  dark:bg-white bg-gray-800 rounded-full">
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.type === "send"
                          ? `To: ${tx.to}`
                          : `From: ${tx.from}`}
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
                      <p className="text-xs text-muted-foreground">
                        {tx.token}
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
