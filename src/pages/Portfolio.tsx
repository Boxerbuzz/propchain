import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Calendar, 
  BarChart3,
  Eye,
  Filter,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Portfolio = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  // Mock portfolio data
  const portfolioStats = {
    totalInvested: 25000,
    currentValue: 27350,
    totalReturn: 2350,
    returnPercentage: 9.4,
    monthlyDividends: 245,
    totalProperties: 5,
    activeInvestments: 5
  };

  const investments = [
    {
      id: "inv-1",
      tokenizationId: "tok-luxury-manhattan",
      propertyTitle: "Luxury Downtown Apartment Complex",
      location: "Manhattan, NY",
      invested: 5000,
      currentValue: 5470,
      return: 470,
      returnPercentage: 9.4,
      tokens: 50,
      totalTokens: 25000,
      status: "active",
      expectedReturn: "8.5%",
      nextDividend: "2024-10-15",
      dividendAmount: 42.5,
      imageUrl: "/placeholder.svg"
    },
    {
      id: "inv-2",
      tokenizationId: "tok-tech-offices",
      propertyTitle: "Tech District Office Building",
      location: "San Francisco, CA",
      invested: 7500,
      currentValue: 7950,
      return: 450,
      returnPercentage: 6.0,
      tokens: 75,
      totalTokens: 30000,
      status: "active",
      expectedReturn: "7.2%",
      nextDividend: "2024-10-20",
      dividendAmount: 56.25,
      imageUrl: "/placeholder.svg"
    },
    {
      id: "inv-3",
      tokenizationId: "tok-retail-center",
      propertyTitle: "Prime Retail Shopping Center",
      location: "Miami, FL",
      invested: 3000,
      currentValue: 3240,
      return: 240,
      returnPercentage: 8.0,
      tokens: 30,
      totalTokens: 20000,
      status: "active",
      expectedReturn: "9.1%",
      nextDividend: "2024-10-25",
      dividendAmount: 28.5,
      imageUrl: "/placeholder.svg"
    },
    {
      id: "inv-4",
      tokenizationId: "tok-warehouse-logistics",
      propertyTitle: "Industrial Warehouse Complex",
      location: "Dallas, TX",
      invested: 6000,
      currentValue: 6420,
      return: 420,
      returnPercentage: 7.0,
      tokens: 60,
      totalTokens: 35000,
      status: "active",
      expectedReturn: "6.8%",
      nextDividend: "2024-11-01",
      dividendAmount: 45.0,
      imageUrl: "/placeholder.svg"
    },
    {
      id: "inv-5",
      tokenizationId: "tok-resort-hotel",
      propertyTitle: "Beachfront Resort Hotel",
      location: "Cancun, Mexico",
      invested: 3500,
      currentValue: 4270,
      return: 770,
      returnPercentage: 22.0,
      tokens: 35,
      totalTokens: 15000,
      status: "funded",
      expectedReturn: "12.5%",
      nextDividend: "2024-11-10",
      dividendAmount: 48.75,
      imageUrl: "/placeholder.svg"
    }
  ];

  const filteredInvestments = investments.filter(inv => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  const upcomingDividends = investments
    .map(inv => ({
      property: inv.propertyTitle,
      amount: inv.dividendAmount,
      date: inv.nextDividend
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">Track your real estate investments and returns</p>
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
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolioStats.totalInvested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {portfolioStats.totalProperties} properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolioStats.currentValue.toLocaleString()}</div>
              <p className="text-xs text-green-600">
                +${portfolioStats.totalReturn} ({portfolioStats.returnPercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Dividends</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolioStats.monthlyDividends}</div>
              <p className="text-xs text-muted-foreground">Next payment in 5 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioStats.activeInvestments}</div>
              <p className="text-xs text-muted-foreground">All performing well</p>
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
                {filteredInvestments.map((investment) => (
                  <Card key={investment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          <img 
                            src={investment.imageUrl} 
                            alt={investment.propertyTitle}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{investment.propertyTitle}</h3>
                            <p className="text-muted-foreground">{investment.location}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={investment.status === "active" ? "default" : "secondary"}>
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
                          onClick={() => navigate(`/portfolio/${investment.tokenizationId}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Invested</p>
                          <p className="font-semibold">${investment.invested.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Value</p>
                          <p className="font-semibold">${investment.currentValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Return</p>
                          <p className={`font-semibold ${investment.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {investment.return >= 0 ? '+' : ''}${investment.return} ({investment.returnPercentage}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Yield</p>
                          <p className="font-semibold">{investment.expectedReturn}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Ownership</span>
                          <span>{((investment.tokens / investment.totalTokens) * 100).toFixed(3)}%</span>
                        </div>
                        <Progress 
                          value={(investment.tokens / investment.totalTokens) * 100} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                    <span className="font-semibold text-green-600">+{portfolioStats.returnPercentage}%</span>
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
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-sm">${dividend.amount}</p>
                        <p className="text-xs text-muted-foreground">{dividend.date}</p>
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