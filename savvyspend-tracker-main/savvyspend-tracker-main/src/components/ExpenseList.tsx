import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Expense, CATEGORY_CONFIG } from "@/lib/expense-store";
import { cn } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  limit?: number;
}

export function ExpenseList({ expenses, onDelete, limit }: ExpenseListProps) {
  const displayed = limit ? expenses.slice(0, limit) : expenses;

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-heading">No expenses yet</p>
        <p className="text-sm">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayed.map((expense, i) => {
        const config = CATEGORY_CONFIG[expense.category];
        return (
          <div
            key={expense.id}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-all hover:shadow-sm animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-lg">
              {config.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{expense.description}</p>
              <p className="text-xs text-muted-foreground">
                {config.label} · {format(new Date(expense.date), "MMM d, yyyy")}
              </p>
            </div>
            <p className="font-heading font-semibold text-sm whitespace-nowrap">
              ₹{expense.amount.toFixed(2)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(expense.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
