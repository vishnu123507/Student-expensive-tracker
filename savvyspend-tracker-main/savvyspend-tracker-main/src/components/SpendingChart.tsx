import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface SpendingChartProps {
  data: { date: string; total: number }[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(val) => format(parseISO(val), "EEE")}
          tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `₹${val}`}
        />
        <Tooltip
          formatter={(value: number) => [`₹${value.toFixed(2)}`, "Spent"]}
          labelFormatter={(label) => format(parseISO(label as string), "MMM d, yyyy")}
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid hsl(214, 20%, 90%)",
            fontSize: "0.875rem",
          }}
        />
        <Bar dataKey="total" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
