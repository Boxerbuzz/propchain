import { TrendingUp, Globe, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MarketSlide = () => {
  return (
    <div className="flex flex-col h-full p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-3">Market Opportunity</h2>
        <p className="text-lg text-muted-foreground">
          Massive untapped potential in real estate tokenization
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="border-2 bg-gradient-to-br from-primary/10 to-card">
          <CardHeader>
            <Globe className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-3xl font-bold">$326.5T</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Global Real Estate Market</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-primary/10 to-card">
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-3xl font-bold">$16T</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Tokenization Market by 2030</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-primary/10 to-card">
          <CardHeader>
            <Target className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-3xl font-bold">5.6M</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Target Investors in Nigeria</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Target Market</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Millennials & Gen Z</span>
              <span className="font-semibold">60%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Retail Investors</span>
              <span className="font-semibold">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Institutional</span>
              <span className="font-semibold">10%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Growth Drivers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <p className="text-sm text-muted-foreground">Rising crypto adoption (24% CAGR)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <p className="text-sm text-muted-foreground">Demand for alternative investments</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <p className="text-sm text-muted-foreground">Regulatory clarity in emerging markets</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketSlide;
