// models/expense-report.ts
export interface ExpenseReportRow {
  expenseId: number;
  expenseDate: string; // yyyy-MM-ddT00:00:00
  categoryName: string;
  subCategoryName?: string | null;
  itemName?: string | null;
  description?: string | null;
  expenseBy?: string | null;
  expenseFor?: string | null;
  amount: number;
}

export interface ExpenseReport {
  totalAmount: number;
  recordCount: number;
  rows: ExpenseReportRow[];
}

export interface ExpenseReportFilter {
  fromDate: string | null;
  toDate: string | null;
  categoryId: number | null;
  subCategoryId: number | null;
  expenseBy: string | null;
  expenseFor: string | null;
}
