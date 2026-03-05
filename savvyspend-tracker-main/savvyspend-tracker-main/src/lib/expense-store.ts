import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Category = "food" | "transport" | "entertainment" | "education" | "shopping" | "other";

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
  created_at: string;
  user_id: string;
}

export interface Budget {
  id: string;
  category: Category;
  budget_limit: number;
  user_id: string;
}

export function useExpenses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data as Expense[]).map((e) => ({
        ...e,
        category: e.category as Category,
      }));
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (expense: { amount: number; category: Category; description: string; date: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          ...expense,
          date: expense.date.split("T")[0],
          user_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  return {
    expenses,
    isLoading,
    addExpense: (expense: { amount: number; category: Category; description: string; date: string }) =>
      addMutation.mutateAsync(expense),
    deleteExpense: (id: string) => deleteMutation.mutateAsync(id),
  };
}

export function useBudgets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*");
      if (error) throw error;
      return (data as Budget[]).map((b) => ({
        ...b,
        category: b.category as Category,
      }));
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ category, limit }: { category: Category; limit: number }) => {
      const { error } = await supabase
        .from("budgets")
        .update({ budget_limit: limit })
        .eq("user_id", user!.id)
        .eq("category", category);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  return {
    budgets,
    isLoading,
    updateBudget: (category: Category, limit: number) =>
      updateMutation.mutateAsync({ category, limit }),
  };
}

export const CATEGORY_CONFIG: Record<Category, { label: string; emoji: string; colorVar: string }> = {
  food: { label: "Food & Dining", emoji: "🍔", colorVar: "chart-food" },
  transport: { label: "Transport", emoji: "🚌", colorVar: "chart-transport" },
  entertainment: { label: "Entertainment", emoji: "🎮", colorVar: "chart-entertainment" },
  education: { label: "Education", emoji: "📚", colorVar: "chart-education" },
  shopping: { label: "Shopping", emoji: "🛍️", colorVar: "chart-shopping" },
  other: { label: "Other", emoji: "📦", colorVar: "chart-other" },
};

export function getCategoryColor(category: Category): string {
  const map: Record<Category, string> = {
    food: "hsl(24, 95%, 53%)",
    transport: "hsl(217, 91%, 60%)",
    entertainment: "hsl(280, 67%, 60%)",
    education: "hsl(160, 84%, 39%)",
    shopping: "hsl(340, 75%, 55%)",
    other: "hsl(45, 93%, 47%)",
  };
  return map[category];
}

export function getExpensesForPeriod(expenses: Expense[], days: number): Expense[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return expenses.filter((e) => new Date(e.date) >= cutoff);
}

export function getDailyTotals(expenses: Expense[], days: number = 7) {
  const result: { date: string; total: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const total = expenses
      .filter((e) => e.date.startsWith(dateStr))
      .reduce((sum, e) => sum + e.amount, 0);
    result.push({ date: dateStr, total });
  }
  return result;
}

export function getCategoryTotals(expenses: Expense[]): { category: Category; total: number }[] {
  const map: Record<string, number> = {};
  expenses.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return Object.entries(map).map(([category, total]) => ({
    category: category as Category,
    total,
  }));
}
