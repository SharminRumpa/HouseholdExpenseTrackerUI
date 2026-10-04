export interface Income {
  incomeId: number;
  incomeCategoryId: number;
  incomeCategoryName: string;
  incomeSourceId?: number | null;
  incomeSourceName?: string | null;
  receivedDate: string;   // yyyy-MM-dd
  actualDate?: string | null;
  amount: number;
  description?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
  lastUpdatedAt?: string | null;
}

export interface IncomeCreate {
  incomeCategoryId: number;
  incomeSourceId?: number | null;
  receivedDate: string;
  actualDate?: string | null;
  amount: number;
  description?: string | null;
  paymentMethod?: string | null;
  Month: string; // yyyy-MM
}

// Minimal shape needed to populate the category dropdown.
export interface IncomeCategoryOption {
  incomeCategoryId: number;
  categoryName: string;
}

export interface IncomeSearchFilter {
  fromDate?: string | null;   // yyyy-MM-dd
  toDate?: string | null;     // yyyy-MM-dd
  categoryId?: number | null;
}

export type IncomeUpdate = IncomeCreate;
