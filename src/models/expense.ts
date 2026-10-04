export interface Expense {
  expenseId: number;
  expenseCategoryId: number;
  expenseCategoryName: string;
  expenseSubCategoryId?: number | null;
  expenseSubCategoryName?: string | null;
  expenseItemId?: number | null;
  expenseItemName?: string | null;
  expenseDate: string;   // yyyy-MM-dd
  amount: number;
  quantity?: number | null;
  unit?: string | null;
  netWeight?: number | null;
  weightUnit?: string | null;
  paymentMethod?: string | null;
  expenseBy?: string | null;
  expenseFor?: string | null;
  description?: string | null;
  createdAt: string;
  lastUpdatedAt?: string | null;
}

export interface ExpenseCreate {
  expenseCategoryId: number;
  expenseSubCategoryId?: number | null;
   expenseItemId?: number | null;
  expenseDate: string;
  amount: number;
  quantity?: number | null;
  unit?: string | null;
  netWeight?: number | null;
  weightUnit?: string | null;
  paymentMethod?: string | null;
  expenseBy?: string | null;
  expenseFor?: string | null;
  description?: string | null;
}

export interface ExpenseSearchFilter {
  fromDate?: string | null;   // yyyy-MM-dd
  toDate?: string | null;     // yyyy-MM-dd
  categoryId?: number | null;
}

export type ExpenseUpdate = ExpenseCreate;


