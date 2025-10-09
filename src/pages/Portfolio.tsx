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
  const { portfolioStats, investments, tokenHoldings, dividendPayments } = portfolioData || {
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
    dividendPayments: [],
  };

  // Transform investments data for display
  const displayInvestments = tokenHoldings.map((holding: any) => {
    const property = holding.tokenizations?.properties;
    const tokenization = holding.tokenizations;
    const primaryImage = property?.property_images?.find((img: any) => img.is_primary) 
      || property?.property_images?.[0];
    
    return {
      id: holding.id,
      tokenizationId: holding.tokenization_id,
      propertyTitle: property?.title || "Property Investment",
      location: property?.location ? 
        `${property.location.city || ''}${property.location.state ? ', ' + property.location.state : ''}` :
        "Location not specified",
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
      totalTokens: tokenization?.total_supply || 0,
      status: holding.balance > 0 ? "active" : "inactive",
      expectedReturn: tokenization?.expected_roi_annual ? 
        `${tokenization.expected_roi_annual}%` : 
        "N/A",
      imageUrl: primaryImage?.image_url || "/placeholder.svg",
    };
  });

  const filteredInvestments = displayInvestments.filter((inv: any) => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  const upcomingDividends = (dividendPayments || [])
    .filter((payment: any) => payment.payment_status === 'pending')
    .map((payment: any) => ({
      property: payment.tokenization_id || "Property",
      amount: payment.amount_ngn || 0,
      date: payment.distribution?.distribution_date || new Date().toISOString().split('T')[0],
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
              <div className="text-xs text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `Across ${portfolioStats.totalProperties} properties`
                )}
              </div>
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
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/50"
                    >
                      <CardContent className="p-0">
                        {/* Header Section with Image and Quick Stats */}
                        <div className="relative">
                          <div className="absolute top-4 right-4 z-10">
                            <Badge
                              variant={
                                investment.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="shadow-lg"
                            >
                              {investment.status}
                            </Badge>
                          </div>
                          <div className="h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden relative">
                            <img
                              src={investment.imageUrl}
                              alt={investment.propertyTitle}
                              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                          </div>
                          
                          {/* Property Title Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="font-bold text-xl text-foreground mb-1 drop-shadow-md">
                              {investment.propertyTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground drop-shadow">
                              {investment.location}
                            </p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="p-6 space-y-6">
                          {/* Primary Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/10">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                <p className="text-xs text-muted-foreground font-medium">
                                  Invested
                                </p>
                              </div>
                              <p className="text-2xl font-bold">
                                ₦{investment.invested.toLocaleString()}
                              </p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-xl p-4 border border-green-500/10">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <p className="text-xs text-muted-foreground font-medium">
                                  Return
                                </p>
                              </div>
                              <p
                                className={`text-2xl font-bold ${
                                  investment.return >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {investment.return >= 0 ? "+" : ""}
                                {investment.returnPercentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          {/* Secondary Metrics */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Current Value
                              </p>
                              <p className="font-semibold text-sm">
                                ₦{investment.currentValue.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Tokens Held
                              </p>
                              <p className="font-semibold text-sm">
                                {investment.tokens.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Expected Yield
                              </p>
                              <p className="font-semibold text-sm">
                                {investment.expectedReturn}
                              </p>
                            </div>
                          </div>

                          {/* Ownership Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium">
                                Your Ownership
                              </span>
                              <span className="font-bold text-primary">
                                {(
                                  (investment.tokens / investment.totalTokens) *
                                  100
                                ).toFixed(3)}
                                %
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={
                                  (investment.tokens / investment.totalTokens) * 100
                                }
                                className="h-3 bg-muted"
                              />
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            className="w-full group-hover:shadow-lg transition-all"
                            onClick={() =>
                              navigate(
                                `/portfolio/${investment.tokenizationId}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Details
                          </Button>
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
                          ₦{dividend.amount}
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
