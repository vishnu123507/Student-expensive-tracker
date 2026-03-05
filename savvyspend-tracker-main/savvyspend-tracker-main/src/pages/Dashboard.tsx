import { Wallet, TrendingDown, CalendarDays, Target } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { BudgetProgress } from "@/components/BudgetProgress";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import {
  useExpenses,
  useBudgets,
  getDailyTotals,
  getCategoryTotals,
  getExpensesForPeriod,
} from "@/lib/expense-store";

export default function Dashboard() {
  const { expenses, addExpense, deleteExpense, isLoading: expLoading } = useExpenses();
  const { budgets, isLoading: budLoading } = useBudgets();

  const thisMonth = getExpensesForPeriod(expenses, 30);
  const thisWeek = getExpensesForPeriod(expenses, 7);
  const today = getExpensesForPeriod(expenses, 1);

  const monthTotal = thisMonth.reduce((s, e) => s + e.amount, 0);
  const weekTotal = thisWeek.reduce((s, e) => s + e.amount, 0);
  const todayTotal = today.reduce((s, e) => s + e.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.budget_limit, 0);
  const remaining = totalBudget - monthTotal;

  const dailyData = getDailyTotals(expenses, 7);
  const categoryData = getCategoryTotals(thisMonth);

  const spentByCategory: Record<string, number> = {};
  thisMonth.forEach((e) => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  });

  if (expLoading || budLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground font-heading">Loading your data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track and manage your student expenses</p>
        </div>
        <AddExpenseDialog onAdd={addExpense} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today" value={`₹${todayTotal.toFixed(0)}`} icon={CalendarDays} subtitle="Daily spending" />
        <StatCard title="This Week" value={`₹${weekTotal.toFixed(0)}`} icon={TrendingDown} subtitle="Last 7 days" />
        <StatCard title="This Month" value={`₹${monthTotal.toFixed(0)}`} icon={Wallet} subtitle="Last 30 days" />
        <StatCard
          title="Budget Left"
          value={`₹${Math.max(remaining, 0).toFixed(0)}`}
          icon={Target}
          subtitle={`of ₹${totalBudget}`}
          trend={remaining < 0 ? "up" : remaining < totalBudget * 0.2 ? "up" : "down"}
          trendValue={remaining < 0 ? "Over budget!" : `${totalBudget > 0 ? ((remaining / totalBudget) * 100).toFixed(0) : 0}% left`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h2 className="font-heading font-semibold mb-4">Weekly Spending</h2>
          <SpendingChart data={dailyData} />
        </div>
        <div className="glass-card rounded-xl p-5">
          <h2 className="font-heading font-semibold mb-4">By Category</h2>
          <CategoryBreakdown data={categoryData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h2 className="font-heading font-semibold mb-4">Budget Overview</h2>
          <BudgetProgress budgets={budgets} spent={spentByCategory} />
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold">Recent Expenses</h2>
          </div>
          <ExpenseList expenses={expenses} onDelete={deleteExpense} limit={5} />
        </div>
      </div>
    </div>
  );
}
