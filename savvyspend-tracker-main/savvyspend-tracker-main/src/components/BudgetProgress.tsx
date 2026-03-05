import { Progress } from "@/components/ui/progress";
import { Budget, Category, CATEGORY_CONFIG, getCategoryColor } from "@/lib/expense-store";
import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  budgets: Budget[];
  spent: Record<string, number>;
}

export function BudgetProgress({ budgets, spent }: BudgetProgressProps) {
  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const config = CATEGORY_CONFIG[budget.category];
        const amount = spent[budget.category] || 0;
        const pct = budget.budget_limit > 0 ? Math.min((amount / budget.budget_limit) * 100, 100) : 0;
        const overBudget = amount > budget.budget_limit;

        return (
          <div key={budget.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <span>{config.emoji}</span>
                <span className="font-medium">{config.label}</span>
              </span>
              <span className={cn("font-heading text-xs", overBudget ? "text-destructive font-semibold" : "text-muted-foreground")}>
                ₹{amount.toFixed(0)} / ₹{budget.budget_limit}
              </span>
            </div>
            <div className="relative">
              <Progress value={pct} className="h-2" />
              {overBudget && (
                <span className="absolute -top-0.5 right-0 text-[10px] text-destructive font-bold">Over!</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
