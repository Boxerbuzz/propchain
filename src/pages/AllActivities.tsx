import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Search,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Shield,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  XCircle,
  CheckCircle2,
  ArrowUpDown,
  Wallet,
  CreditCard,
  Banknote,
  Coins,
} from "lucide-react";
import { useUnifiedActivityFeed } from "@/hooks/useUnifiedActivityFeed";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { formatDistanceToNow } from "date-fns";

const AllActivities = () => {
  const navigate = useNavigate();

  // Format number utility function
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };
  const { activities: unifiedActivities, isLoading: unifiedLoading } =
    useUnifiedActivityFeed(50);
  const { transactions, isLoading: transactionsLoading } =
    useWalletTransactions();
  const { activities: activityLogs, isLoading: activityLoading } =
    useActivityFeed(50);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTimeframe, setFilterTimeframe] = useState("all");

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case "investment":
        return TrendingUp;
      case "dividend":
        return DollarSign;
      case "property_event":
        return Building2;
      case "governance":
        return Users;
      case "security":
        return Shield;
      case "transaction":
        return ArrowUpDown;
      case "wallet":
        return Wallet;
      case "payment":
        return CreditCard;
      case "deposit":
        return Banknote;
      case "withdrawal":
        return Coins;
      case "reminder":
        return Calendar;
      case "alert":
        return AlertTriangle;
      case "info":
        return Info;
      case "success":
        return CheckCircle;
      default:
        return Activity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return CheckCircle2;
      case "pending":
        return Clock;
      case "failed":
      case "error":
        return XCircle;
      default:
        return Info;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "investment":
        return "text-blue-600 bg-blue-50";
      case "dividend":
        return "text-green-600 bg-green-50";
      case "property_event":
        return "text-purple-600 bg-purple-50";
      case "governance":
        return "text-orange-600 bg-orange-50";
      case "security":
        return "text-red-600 bg-red-50";
      case "transaction":
        return "text-gray-600 bg-gray-50";
      case "wallet":
        return "text-indigo-600 bg-indigo-50";
      case "payment":
        return "text-pink-600 bg-pink-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Combine all activities
  const allActivities = [
    ...unifiedActivities.map((activity) => ({
      ...activity,
      source: "unified",
    })),
    ...transactions.map((tx) => ({
      id: `tx-${tx.id}`,
      type: "transaction",
      title:
        tx.type === "investment"
          ? "Investment"
          : tx.type === "dividend"
          ? "Dividend Payment"
          : tx.type === "withdrawal"
          ? "Withdrawal"
          : tx.type === "deposit"
          ? "Deposit"
          : "Transaction",
      description: tx.description || `${tx.type} transaction`,
      status:
        tx.status === "completed"
          ? "completed"
          : tx.status === "failed"
          ? "failed"
          : "pending",
      timestamp: tx.timestamp,
      amount: tx.amount,
      currency: tx.currency,
      source: "transaction",
    })),
    ...activityLogs.map((activity) => ({
      id: `log-${activity.id}`,
      type: activity.activity_type?.includes("investment")
        ? "investment"
        : "property_event",
      title:
        activity.activity_type
          ?.replace(/_/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Activity",
      description: activity.description || "",
      status: "info",
      timestamp: activity.created_at,
      source: "activity_log",
    })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || activity.type === filterType;
    const matchesStatus =
      filterStatus === "all" || activity.status === filterStatus;

    // Timeframe filter
    let matchesTimeframe = true;
    if (filterTimeframe !== "all") {
      const now = new Date();
      const activityDate = new Date(activity.timestamp);

      switch (filterTimeframe) {
        case "today":
          matchesTimeframe = activityDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesTimeframe = activityDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesTimeframe = activityDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesTimeframe;
  });

  const handleActivityClick = (activity: any) => {
    if (activity.type === "investment" || activity.type === "property_event") {
      navigate("/portfolio");
    } else if (activity.type === "transaction") {
      navigate("/account/transactions");
    } else if (activity.type === "governance") {
      navigate("/portfolio");
    }
  };

  const activityTypes = [
    { value: "all", label: "All Types" },
    { value: "investment", label: "Investments" },
    { value: "dividend", label: "Dividends" },
    { value: "property_event", label: "Property Events" },
    { value: "governance", label: "Governance" },
    { value: "transaction", label: "Transactions" },
    { value: "wallet", label: "Wallet" },
    { value: "security", label: "Security" },
  ];

  const statusTypes = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "info", label: "Information" },
  ];

  const timeframes = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  const isLoading = unifiedLoading || transactionsLoading || activityLoading;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-2 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Dashboard</span>
      </Button>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              All Activities
            </h1>
            <p className="text-muted-foreground">
              View and track all your account activities
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusTypes.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((timeframe) => (
                  <SelectItem key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activities ({filteredActivities.length})</span>
            <div className="flex gap-2">
              <Badge variant="outline">
                {allActivities.filter((a) => a.status === "completed").length}{" "}
                completed
              </Badge>
              <Badge variant="outline">
                {allActivities.filter((a) => a.status === "pending").length}{" "}
                pending
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-6 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No activities found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ||
                filterType !== "all" ||
                filterStatus !== "all" ||
                filterTimeframe !== "all"
                  ? "Try adjusting your filters to see more activities."
                  : "You have no activities at the moment."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(
                  activity.type,
                  activity.status
                );
                const StatusIcon = getStatusIcon(activity.status);
                const typeColorClasses = getActivityTypeColor(activity.type);
                const statusColorClasses = getStatusColor(activity.status);

                return (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${typeColorClasses}`}>
                        <ActivityIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">
                            {activity.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {"amount" in activity && activity.amount && (
                              <span className="text-sm font-semibold text-foreground">
                                {"currency" in activity &&
                                activity.currency === "NGN"
                                  ? formatNumber(activity.amount as number)
                                  : `$${(
                                      activity.amount as number
                                    ).toLocaleString()}`}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(activity.timestamp),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {activity.type.replace("_", " ")}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusColorClasses}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {activity.status}
                          </div>
                          {activity.source && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.source}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllActivities;
