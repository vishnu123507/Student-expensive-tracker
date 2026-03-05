import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useExpenses, useBudgets, getExpensesForPeriod, Category, CATEGORY_CONFIG, getCategoryColor } from "@/lib/expense-store";
import { toast } from "sonner";
import { Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Budgets() {
  const { expenses } = useExpenses();
  const { budgets, updateBudget, isLoading } = useBudgets();
  const [editing, setEditing] = useState<Category | null>(null);
  const [editValue, setEditValue] = useState("");

  const thisMonth = getExpensesForPeriod(expenses, 30);
  const spentByCategory: Record<string, number> = {};
  thisMonth.forEach((e) => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  });

  const totalBudget = budgets.reduce((s, b) => s + b.budget_limit, 0);
  const totalSpent = Object.values(spentByCategory).reduce((s, v) => s + v, 0);

  const startEditing = (cat: Category, currentLimit: number) => {
    setEditing(cat);
    setEditValue(String(currentLimit));
  };

  const saveEdit = async (cat: Category) => {
    const val = parseFloat(editValue);
    if (!val || val <= 0) {
      toast.error("Enter a valid budget amount");
      return;
    }
    await updateBudget(cat, val);
    setEditing(null);
    toast.success("Budget updated!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground font-heading">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">Budget Manager</h1>
        <p className="text-sm text-muted-foreground">
          ₹{totalSpent.toFixed(0)} spent of ₹{totalBudget} total budget this month
        </p>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground font-heading">
            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%
          </span>
        </div>
        <Progress value={totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0} className="h-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const config = CATEGORY_CONFIG[budget.category];
          const spent = spentByCategory[budget.category] || 0;
          const pct = budget.budget_limit > 0 ? Math.min((spent / budget.budget_limit) * 100, 100) : 0;
          const overBudget = spent > budget.budget_limit;
          const isEditing = editing === budget.category;

          return (
            <div key={budget.category} className="glass-card rounded-xl p-5 space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: getCategoryColor(budget.category) + "20" }}
                  >
                    {config.emoji}
                  </div>
                  <span className="font-heading font-semibold">{config.label}</span>
                </div>
                {isEditing ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveEdit(budget.category)}>
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditing(budget.category, budget.budget_limit)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-baseline justify-between">
                <span className={cn("text-xl font-heading font-bold", overBudget && "text-destructive")}>
                  ₹{spent.toFixed(0)}
                </span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 h-8 text-sm text-right"
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(budget.category)}
                    autoFocus
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">of ₹{budget.budget_limit}</span>
                )}
              </div>

              <Progress value={pct} className="h-2" />
              {overBudget && (
                <p className="text-xs text-destructive font-medium">
                  ⚠️ Over budget by ₹{(spent - budget.budget_limit).toFixed(0)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
