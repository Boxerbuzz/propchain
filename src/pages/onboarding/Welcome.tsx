import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, TrendingUp, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PC</span>
              </div>
              <span className="text-xl font-bold text-foreground">PropChain</span>
            </div>
            
            {/* Progress */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Step 1 of 3</span>
              <Progress value={33} className="w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Welcome to PropChain!
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You're now part of Nigeria's leading real estate tokenization platform. 
            Let's get you set up to start investing in premium properties.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Investing</h3>
              <p className="text-sm text-muted-foreground">
                Invest in fractionalized real estate with as little as ₦10,000
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure & Transparent</h3>
              <p className="text-sm text-muted-foreground">
                Blockchain-powered transparency with bank-level security
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">
                Join a community of investors and participate in property decisions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What's Next */}
        <Card className="border-border mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-bold">1</span>
                </div>
                <span className="text-sm text-muted-foreground">Complete your profile setup</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-muted rounded-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-bold">2</span>
                </div>
                <span className="text-sm text-muted-foreground">Verify your identity (KYC)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-muted rounded-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-bold">3</span>
                </div>
                <span className="text-sm text-muted-foreground">Set up your wallet and start investing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <Link to="/onboarding/profile-setup">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}