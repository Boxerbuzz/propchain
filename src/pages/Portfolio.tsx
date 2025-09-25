import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  BarChart3,
  Eye,
  Filter,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAuth } from "@/hooks/useAuth";

const Portfolio = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const { isAuthenticated } = useAuth();

  // Fetch real portfolio data
  const { data: portfolioData, isLoading, error } = usePortfolio();
  const { portfolioStats, investments, tokenHoldings } = portfolioData || {
    portfolioStats: {
      totalInvested: 0,
      currentValue: 0,
      totalReturns: 0,
      totalDividends: 0,
      activeInvestments: 0,
      performancePercentage: 0,
    },
    investments: [],
    tokenHoldings: [],
  };

  // Transform investments data for display
  const displayInvestments = tokenHoldings.map((holding: any) => ({
    id: holding.id,
    tokenizationId: holding.tokenization_id,
    propertyTitle:
      `Property ${holding.property_id?.slice(0, 8)}...` ||
      "Property Investment",
    location: "Location TBD", // This would come from joining with properties table
    invested: holding.total_invested_ngn || 0,
    currentValue:
      (holding.total_invested_ngn || 0) + (holding.unrealized_returns_ngn || 0),
    return:
      (holding.unrealized_returns_ngn || 0) +
      (holding.realized_returns_ngn || 0),
    returnPercentage:
      holding.total_invested_ngn > 0
        ? (((holding.unrealized_returns_ngn || 0) +
            (holding.realized_returns_ngn || 0)) /
            holding.total_invested_ngn) *
          100
        : 0,
    tokens: holding.balance || 0,
    totalTokens: 100000, // This would come from tokenizations table
    status: holding.balance > 0 ? "active" : "inactive",
    expectedReturn: "8.5%", // This would come from tokenizations table
    nextDividend: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Mock next month
    dividendAmount: ((holding.total_invested_ngn || 0) * 0.08) / 12, // Mock monthly dividend
    imageUrl: "/placeholder.svg",
  }));

  const filteredInvestments = displayInvestments.filter((inv: any) => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  const upcomingDividends = displayInvestments
    .map((inv: any) => ({
      property: inv.propertyTitle,
      amount: inv.dividendAmount,
      date: inv.nextDividend,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your portfolio.
          </p>
          <Button onClick={() => navigate("/auth/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">
              Track your real estate investments and returns
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Invested
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="text-2xl font-bold">
                  ₦{portfolioStats.totalInvested.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `Across ${portfolioStats.totalProperties} properties`
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="text-2xl font-bold">
                  ₦{portfolioStats.currentValue.toLocaleString()}
                </div>
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <p
                  className={`text-xs ${
                    portfolioStats.totalReturn >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {portfolioStats.totalReturn >= 0 ? "+" : ""}₦
                  {portfolioStats.totalReturn?.toLocaleString()} (
                  {portfolioStats.returnPercentage?.toFixed(1)}%)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Dividends
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${portfolioStats.monthlyDividends}
              </div>
              <p className="text-xs text-muted-foreground">
                Next payment in 5 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Investments
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolioStats.activeInvestments}
              </div>
              <p className="text-xs text-muted-foreground">
                All performing well
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Portfolio Content */}
          <div className="lg:col-span-2">
            <Tabs value={filter} onValueChange={setFilter}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Investments</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="funded">Funded</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={filter} className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Skeleton className="w-16 h-16 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-64" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : error ? (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      Failed to load portfolio data
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </Card>
                ) : filteredInvestments.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Investments Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't made any investments yet. Start by browsing
                      available properties.
                    </p>
                    <Button onClick={() => navigate("/browse")}>
                      Browse Properties
                    </Button>
                  </Card>
                ) : (
                  filteredInvestments.map((investment: any) => (
                    <Card
                      key={investment.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-4">
                            <img
                              src={investment.imageUrl}
                              alt={investment.propertyTitle}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="font-semibold text-lg">
                                {investment.propertyTitle}
                              </h3>
                              <p className="text-muted-foreground">
                                {investment.location}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    investment.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {investment.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {investment.tokens} tokens
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/portfolio/${investment.tokenizationId}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Invested
                            </p>
                            <p className="font-semibold">
                              ₦{investment.invested.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Current Value
                            </p>
                            <p className="font-semibold">
                              ₦{investment.currentValue.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Return
                            </p>
                            <p
                              className={`font-semibold ${
                                investment.return >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {investment.return >= 0 ? "+" : ""}₦
                              {investment.return.toLocaleString()} (
                              {investment.returnPercentage.toFixed(1)}%)
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Expected Yield
                            </p>
                            <p className="font-semibold">
                              {investment.expectedReturn}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Ownership</span>
                            <span>
                              {(
                                (investment.tokens / investment.totalTokens) *
                                100
                              ).toFixed(3)}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (investment.tokens / investment.totalTokens) * 100
                            }
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Return</span>
                    <span className="font-semibold text-green-600">
                      +{portfolioStats.returnPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Best Performer</span>
                    <span className="font-semibold">+22.0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg. Monthly Yield</span>
                    <span className="font-semibold">0.98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Dividends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Dividends
                </CardTitle>
                <CardDescription>Next dividend payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDividends.map((dividend, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          ${dividend.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dividend.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground truncate max-w-32">
                          {dividend.property}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => navigate("/browse")}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Browse Properties
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
