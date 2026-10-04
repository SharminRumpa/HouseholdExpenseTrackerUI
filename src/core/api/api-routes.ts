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
    byId: (id: number) => `${baseUrl}/expense/${id}`
  },
  category: {
    incomeCategories: () => `${baseUrl}/category/income`,
    expenseCategories: () => `${baseUrl}/category/expense`,
    expenseSubCategories: (categoryId: number) =>
      `${baseUrl}/category/expense/${categoryId}/subcategories`,
    incomeSources: () => `${baseUrl}/category/income-sources`,
    expenseCategoryById: (id: number) => `${baseUrl}/category/expense/${id}`,
    incomeCategoryById: (id: number) => `${baseUrl}/category/income/${id}`,
    incomeSourceById: (id: number) => `${baseUrl}/category/income-sources/${id}`,

    getExpenseSubCategories: () => `${baseUrl}/category/expense-subcategories`,
  },

  user: {
    base: () => `${baseUrl}/user`,
    byId: (id: number) => `${baseUrl}/user/${id}`
  },

    role: {
    base: () => `${baseUrl}/role`,
    permissions: (roleId: number) => `${baseUrl}/role/${roleId}/permissions`
  },

  dashboard: {
    summary: () => `${baseUrl}/dashboard/summary`
  },
  auth: {
    // Not live on the API yet (AuthController was removed) — kept here so
    // AuthService doesn't need to change when it comes back.
    login: () => `${baseUrl}/auth/login`,
    register: () => `${baseUrl}/auth/register`
  }
};