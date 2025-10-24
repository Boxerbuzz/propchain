import { AlertCircle, Lock, TrendingDown, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ProblemSlide = () => {
  const problems = [
    {
      icon: Lock,
      title: "High Barriers to Entry",
      description: "Real estate investment requires significant capital, excluding 95% of potential investors",
    },
    {
      icon: TrendingDown,
      title: "Limited Liquidity",
      description: "Traditional real estate is illiquid, with lengthy and costly selling processes",
    },
    {
      icon: Users,
      title: "Lack of Transparency",
      description: "Opaque processes and limited access to investment opportunities for retail investors",
    },
    {
      icon: AlertCircle,
      title: "Geographic Constraints",
      description: "Investors are limited to local markets, missing diverse opportunities",
    },
  ];

  return (
    <div className="flex flex-col h-full p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-3">The Problem</h2>
        <p className="text-lg text-muted-foreground">
          Real estate remains one of the most inaccessible asset classes
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {problems.map((problem, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <problem.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
              <p className="text-muted-foreground">{problem.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProblemSlide;
