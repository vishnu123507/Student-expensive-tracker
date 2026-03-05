import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Category, CATEGORY_CONFIG, getCategoryColor } from "@/lib/expense-store";

interface CategoryBreakdownProps {
  data: { category: Category; total: number }[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const total = data.reduce((s, d) => s + d.total, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        No data to display
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={55}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={getCategoryColor(entry.category)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `₹${value.toFixed(2)}`,
              CATEGORY_CONFIG[name as Category]?.label || name,
            ]}
            contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(214, 20%, 90%)", fontSize: "0.875rem" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 w-full md:w-auto">
        {data
          .sort((a, b) => b.total - a.total)
          .map((item) => {
            const config = CATEGORY_CONFIG[item.category];
            const pct = total > 0 ? ((item.total / total) * 100).toFixed(0) : "0";
            return (
              <div key={item.category} className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(item.category) }} />
                <span className="text-muted-foreground flex-1 whitespace-nowrap">{config.emoji} {config.label}</span>
                <span className="font-medium font-heading">₹{item.total.toFixed(0)}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
