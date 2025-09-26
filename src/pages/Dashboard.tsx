import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Wallet,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { useNotifications } from "../hooks/useNotifications";

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, isLoading, shouldShowKycAlert } = useDashboard();
  const {
    notifications,
    isLoading: notificationsLoading,
    markAllAsRead,
  } = useNotifications();


  console.log(user);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getDisplayName = () => {
    if (!user) return "User";
    return user.first_name || user.email?.split("@")[0] || "User";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {getDisplayName()}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your investments today.
          </p>
        </div>

        {/* KYC Status Alert */}
        {shouldShowKycAlert && (
          <Card className="border-amber-200 bg-amber-50 mb-8">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-3 mb-3 md:mb-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800">
                      Complete Your Verification
                    </h3>
                    <p className="text-sm text-amber-700">
                      {user?.kyc_status === "pending"
                        ? "Your KYC is being processed. Complete verification to unlock all features."
                        : "Verify your identity to unlock all features and higher limits"}
                    </p>
                  </div>
                </div>
                <Link to="/kyc/start">
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full md:w-auto"
                  >
                    {user?.kyc_status === "pending"
                      ? "Check Status"
                      : "Verify Now"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Portfolio Value
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {formatNumber(stats.portfolioValue)}
                  </p>
                  <div className="flex items-center mt-1">
                    {stats.returnPercentage >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        stats.returnPercentage >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {Math.abs(stats.returnPercentage).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Properties</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {stats.propertiesCount}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Active investments
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Returns</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {formatNumber(stats.totalReturns)}
                  </p>
                  <div className="flex items-center mt-1">
                    {stats.totalReturns >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        stats.totalReturns >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatNumber(Math.abs(stats.totalReturns))}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Wallet Balance
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {formatNumber(stats.walletBalance)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Available to invest
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    No Recent Activity
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start investing to see your activity here
                  </p>
                  <Link to="/browse">
                    <Button>Browse Properties</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="border-border mb-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/browse" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
                <Link to="/wallet/setup" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Set Up Wallet
                  </Button>
                </Link>
                <Link to="/portfolio" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    View Portfolio
                  </Button>
                </Link>
                <Link to="/kyc/start" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Complete KYC
                  </Button>
                </Link>
                <Link to="/property/management" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Manage Properties
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {notifications.filter((n) => !n.read_at).length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {notifications.filter((n) => !n.read_at).length}
                    </Badge>
                  )}
                </CardTitle>
                {notifications.filter((n) => !n.read_at).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.read_at ? "bg-muted" : "bg-primary"
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              notification.read_at
                                ? "text-muted-foreground"
                                : "font-medium text-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              notification.created_at
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <div className="text-center pt-2">
                        <Link to="/settings/notifications">
                          <Button variant="ghost" size="sm" className="text-xs">
                            View all notifications
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      No notifications
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You're all caught up!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
