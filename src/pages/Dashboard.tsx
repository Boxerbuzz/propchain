import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Building, Users, Target, BarChart3, PieChart, Activity, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, John! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your investments today.
          </p>
        </div>

        {/* KYC Status Alert */}
        <Card className="border-amber-200 bg-amber-50 mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-3 mb-3 md:mb-0">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">Complete Your Verification</h3>
                  <p className="text-sm text-amber-700">
                    Verify your identity to unlock all features and higher limits
                  </p>
                </div>
              </div>
              <Link to="/kyc/start">
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full md:w-auto">
                  Verify Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">₦0</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">0%</span>
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
                  <p className="text-xl md:text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground mt-1">Active investments</p>
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
                  <p className="text-sm text-muted-foreground">Monthly Returns</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">₦0</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">0%</span>
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
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">₦0</p>
                  <p className="text-sm text-muted-foreground mt-1">Available to invest</p>
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
                  <h3 className="font-semibold text-foreground mb-2">No Recent Activity</h3>
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
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Building className="w-4 h-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
                <Link to="/wallet/setup" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Set Up Wallet
                  </Button>
                </Link>
                <Link to="/portfolio" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <PieChart className="w-4 h-4 mr-2" />
                    View Portfolio
                  </Button>
                </Link>
                <Link to="/kyc/start" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Target className="w-4 h-4 mr-2" />
                    Complete KYC
                  </Button>
                </Link>
                <Link to="/property/management" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Building className="w-4 h-4 mr-2" />
                    Manage Properties
                  </Button>
                </Link>
                <Link to="/wallet/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Welcome to PropChain!</p>
                      <p className="text-xs text-muted-foreground">Complete your profile to get started</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}