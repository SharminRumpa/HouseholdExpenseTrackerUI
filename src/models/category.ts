export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string | null;
  isActive: boolean;
}

export interface CategoryCreate {
  categoryName: string;
  description?: string | null;
}

export interface CategoryUpdate {
  categoryName: string;
  description?: string | null;
  isActive: boolean;
}

export interface ExpenseSubCategory {
  subCategoryId: number;
  categoryId: number;
  categoryName: string;
  subCategoryName: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  lastUpdatedAt?: string | null;
}

// Create and update accept the same fields, so they share one payload type.
export interface ExpenseSubCategoryPayload {
  expenseCategoryId: number;
  subCategoryName: string;
  description: string | null;
  isActive: boolean;
}

export interface IncomeSource {
  incomeSourceId: number;
  sourceName: string;
  description?: string | null;
  isActive: boolean;
}

export interface IncomeSourceCreate {
  sourceName: string;
  description?: string | null;
}

export interface IncomeSourceUpdate {
  sourceName: string;
  description?: string | null;
  isActive: boolean;
}
