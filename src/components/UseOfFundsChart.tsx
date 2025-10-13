import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FundAllocation } from './FundAllocationBuilder';

interface UseOfFundsChartProps {
  data: FundAllocation[];
  targetRaise: number;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function UseOfFundsChart({ data, targetRaise }: UseOfFundsChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map(item => ({
    name: item.category,
    value: item.amount_ngn,
    percentage: item.percentage
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Use of Funds Breakdown</CardTitle>
        <CardDescription>
          How the ₦{targetRaise.toLocaleString()} raised will be allocated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `₦${value.toLocaleString()}`}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-3">
          {data.map((item, index) => (
            <div key={item.id} className="flex justify-between items-start border-b pb-2">
              <div className="flex items-start gap-2 flex-1">
                <div 
                  className="w-4 h-4 rounded-full mt-1 flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.category}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-sm">₦{item.amount_ngn.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
