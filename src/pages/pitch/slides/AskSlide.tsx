import { Target, Rocket, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AskSlide = () => {
  const useOfFunds = [
    { category: "Product Development", percentage: 40, amount: "$800K" },
    { category: "Marketing & Sales", percentage: 30, amount: "$600K" },
    { category: "Operations", percentage: 20, amount: "$400K" },
    { category: "Legal & Compliance", percentage: 10, amount: "$200K" },
  ];

  const milestones = [
    "Launch in 3 additional cities",
    "Onboard 10,000+ users",
    "Tokenize $50M in property value",
    "Achieve regulatory approval in 2 markets",
  ];

  return (
    <div className="flex flex-col h-full p-12 bg-gradient-to-br from-primary/5 to-background">
      <div className="mb-8 text-center">
        <h2 className="text-5xl font-bold mb-3">The Ask</h2>
        <p className="text-2xl text-muted-foreground mb-6">
          Raising <span className="text-primary font-bold">$2M</span> Seed Round
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card className="border-2 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Use of Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {useOfFunds.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-muted-foreground">{item.amount}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              12-Month Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm">{milestone}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-card rounded-lg border-2">
          <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold">Expand Markets</p>
          <p className="text-xs text-muted-foreground">Lagos, Abuja, PH</p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border-2">
          <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold">Timeline</p>
          <p className="text-xs text-muted-foreground">18 months runway</p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border-2">
          <Target className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold">Series A Target</p>
          <p className="text-xs text-muted-foreground">Q4 2025</p>
        </div>
      </div>

      <div className="text-center mt-auto">
        <h3 className="text-2xl font-bold mb-4">Let's Build the Future of Real Estate Together</h3>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="text-lg px-8">
            Schedule a Meeting
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            Download Full Deck
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          contact@hederasuite.com • +234 xxx xxx xxxx
        </p>
      </div>
    </div>
  );
};

export default AskSlide;
