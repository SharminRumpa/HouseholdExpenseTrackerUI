export interface CategoryTotal {
  categoryName: string;
  total: number;
}

export interface DashboardSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  totalDailyIncome: number;
  totalDailyExpense: number;
  balance: number;
  expenseByCategory: CategoryTotal[];
  incomeByCategory: CategoryTotal[];
}
