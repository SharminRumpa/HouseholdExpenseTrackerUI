// models/expense-item.ts
export interface ExpenseItem {
  expenseItemId: number;
  expenseCategoryId: number;
  expenseCategoryName: string;
  expenseSubCategoryId: number;
  expenseSubCategoryName: string;
  itemName: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  lastUpdatedAt?: string | null;
}

// Create and update accept the same fields, so they share one payload type.
export interface ExpenseItemPayload {
  expenseSubCategoryId: number;
  itemName: string;
  description: string | null;
  isActive: boolean;
}
