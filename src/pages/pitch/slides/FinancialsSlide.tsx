import { TrendingUp, DollarSign, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FinancialsSlide = () => {
  const revenueData = [
    { year: "2024", revenue: 150, expenses: 120 },
    { year: "2025", revenue: 450, expenses: 250 },
    { year: "2026", revenue: 1200, expenses: 500 },
    { year: "2027", revenue: 2800, expenses: 900 },
  ];

  return (
    <div className="flex flex-col h-full p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-3">Financial Projections</h2>
        <p className="text-lg text-muted-foreground">
          Path to profitability and sustainable growth
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="border-2 bg-gradient-to-br from-primary/10 to-card">
          <CardHeader>
            <TrendingUp className="h-6 w-6 text-primary mb-2" />
            <CardTitle className="text-sm text-muted-foreground">2027 Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$2.8M</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-primary/10 to-card">
          <CardHeader>
            <DollarSign className="h-6 w-6 text-primary mb-2" />
            <CardTitle className="text-sm text-muted-foreground">Gross Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">68%</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-primary/10 to-card">
          <CardHeader>
            <PieChart className="h-6 w-6 text-primary mb-2" />
            <CardTitle className="text-sm text-muted-foreground">Break-even</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Q3 2025</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 flex-1">
        <CardHeader>
          <CardTitle>Revenue vs Expenses (in $1000s)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--destructive))"
                strokeWidth={3}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-sm">
          <p className="font-semibold mb-1">Key Assumptions:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• 15 new properties per quarter</li>
            <li>• Average property value: $500K</li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-1">Growth Drivers:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Expansion to 3 new markets</li>
            <li>• Premium tier launch Q2 2025</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FinancialsSlide;
