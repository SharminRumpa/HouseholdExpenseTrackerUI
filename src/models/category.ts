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

export interface SubCategory {
  subCategoryId: number;
  categoryId: number;
  categoryName: string;
  subCategoryName: string;
  description?: string | null;
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