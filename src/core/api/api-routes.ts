// src/app/core/api/api-routes.ts
import { environment } from '../../environments/environment';

const baseUrl = environment.apiBaseUrl;

export const ApiRoutes = {
  income: {
    base: () => `${baseUrl}/income`,
    byId: (id: number) => `${baseUrl}/income/${id}`,
    //incomeCategoryById: (id: number) => `${baseUrl}/income/category/${id}`
  },

  expense: {
    base: () => `${baseUrl}/expense`,
    byId: (id: number) => `${baseUrl}/expense/${id}`,
  },

  //#region Expense Delete Requests Routes
  expenseDelete: {
    base: () => `${baseUrl}/expense/delete`,
    byId: (id: number) => `${baseUrl}/expense/delete/${id}`,

    deleteRequestById: (id: number) => `${baseUrl}/expense/delete/${id}`,
  },
  //#endregion

  categories: {
    incomeCategories: () => `${baseUrl}/categories/income`,
    expenseCategories: () => `${baseUrl}/categories/expense`,
    expenseSubCategories: (categoryId: number) =>
      `${baseUrl}/categories/expense/${categoryId}/subcategories`,
    incomeSources: () => `${baseUrl}/categories/income-sources`,
    expenseCategoryById: (id: number) => `${baseUrl}/categories/expense/${id}`,
    incomeCategoryById: (id: number) => `${baseUrl}/categories/income/${id}`,
    incomeSourceById: (id: number) => `${baseUrl}/categories/income-sources/${id}`,

    getExpenseSubCategories: () => `${baseUrl}/categories/expense-subcategories`,
  },

  user: {
    base: () => `${baseUrl}/user`,
    byId: (id: number) => `${baseUrl}/user/${id}`,
  },

  role: {
    base: () => `${baseUrl}/role`,
    permissions: (roleId: number) => `${baseUrl}/role/${roleId}/permissions`,
  },

  dashboard: {
    summary: () => `${baseUrl}/dashboard/summary`,
  },
  auth: {
    // Not live on the API yet (AuthController was removed) — kept here so
    // AuthService doesn't need to change when it comes back.
    login: () => `${baseUrl}/auth/login`,
    register: () => `${baseUrl}/auth/register`,
  },
};
