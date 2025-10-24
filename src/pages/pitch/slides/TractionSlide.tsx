import { Users, Building2, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const TractionSlide = () => {
  const metrics = [
    {
      icon: Users,
      label: "Active Users",
      value: "2,500+",
      growth: "+180% MoM",
    },
    {
      icon: Building2,
      label: "Properties Listed",
      value: "47",
      growth: "+12 this month",
    },
    {
      icon: DollarSign,
      label: "Total Value Locked",
      value: "$2.3M",
      growth: "+250% QoQ",
    },
    {
      icon: TrendingUp,
      label: "Avg. Token Sold",
      value: "78%",
      growth: "Per property",
    },
  ];

  return (
    <div className="flex flex-col h-full p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-3">Traction & Milestones</h2>
        <p className="text-lg text-muted-foreground">
          Strong early adoption and market validation
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-2 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <metric.icon className="h-8 w-8 text-primary" />
                <span className="text-xs font-semibold text-green-600">{metric.growth}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-bold mb-1">{metric.value}</CardTitle>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Key Milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Platform Launch</span>
                <span className="text-xs text-muted-foreground">Q1 2024</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">First Property Tokenized</span>
                <span className="text-xs text-muted-foreground">Q2 2024</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Regulatory Approval</span>
                <span className="text-xs text-muted-foreground">Q3 2024</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Partnerships</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10" />
              <div>
                <p className="font-medium">Hedera Hashgraph</p>
                <p className="text-xs text-muted-foreground">Blockchain Infrastructure</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10" />
              <div>
                <p className="font-medium">Leading Property Managers</p>
                <p className="text-xs text-muted-foreground">Operational Partners</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10" />
              <div>
                <p className="font-medium">Payment Gateway</p>
                <p className="text-xs text-muted-foreground">Fiat On/Off Ramp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TractionSlide;
