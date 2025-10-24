import { DollarSign, Percent, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BusinessModelSlide = () => {
  const revenueStreams = [
    {
      icon: Percent,
      name: "Transaction Fees",
      value: "2-3%",
      description: "On all property token purchases",
    },
    {
      icon: DollarSign,
      name: "Management Fees",
      value: "1.5%",
      description: "Annual fee on total AUM",
    },
    {
      icon: TrendingUp,
      name: "Performance Fees",
      value: "10%",
      description: "On property appreciation gains",
    },
    {
      icon: Users,
      name: "Premium Services",
      value: "Variable",
      description: "Advanced analytics & priority access",
    },
  ];

  return (
    <div className="flex flex-col h-full p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-3">Business Model</h2>
        <p className="text-lg text-muted-foreground">
          Multiple revenue streams driving sustainable growth
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {revenueStreams.map((stream, index) => (
          <Card key={index} className="border-2 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <stream.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold">{stream.value}</CardTitle>
              </div>
              <CardTitle className="text-lg">{stream.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stream.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 bg-gradient-to-br from-primary/10 to-card">
        <CardHeader>
          <CardTitle className="text-xl">Unit Economics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Customer Acquisition Cost</p>
            <p className="text-2xl font-bold">$45</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Lifetime Value</p>
            <p className="text-2xl font-bold">$1,250</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">LTV:CAC Ratio</p>
            <p className="text-2xl font-bold text-green-600">27:1</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessModelSlide;
