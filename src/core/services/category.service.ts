import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiRoutes } from '../api/api-routes';
import {
  Category,
  CategoryCreate,
  CategoryUpdate,
  IncomeSource,
  IncomeSourceCreate,
  IncomeSourceUpdate,
  ExpenseSubCategory,
  ExpenseSubCategoryPayload,
} from '../../models/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  // Income categories
  getIncomeCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(ApiRoutes.categories.incomeCategories());
  }

  createIncomeCategory(dto: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(ApiRoutes.categories.incomeCategories(), dto);
  }

  updateIncomeCategory(id: number, dto: CategoryUpdate): Observable<Category> {
    return this.http.put<Category>(ApiRoutes.categories.incomeCategoryById(id), dto);
  }

  deleteIncomeCategory(id: number): Observable<void> {
    return this.http.delete<void>(ApiRoutes.categories.incomeCategoryById(id));
  }

  // Expense categories
  getExpenseCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(ApiRoutes.categories.expenseCategories());
  }

  updateExpenseCategory(id: number, dto: CategoryUpdate): Observable<Category> {
    return this.http.put<Category>(ApiRoutes.categories.expenseCategoryById(id), dto);
  }

  deleteExpenseCategory(id: number): Observable<void> {
    return this.http.delete<void>(ApiRoutes.categories.expenseCategoryById(id));
  }

  getExpenseSubCategories(categoryId: number): Observable<ExpenseSubCategory[]> {
    return this.http.get<ExpenseSubCategory[]>(
      ApiRoutes.categories.expenseSubCategories(categoryId),
    );
  }

  // Expense Sub categories
  getAllExpenseSubCategories(): Observable<ExpenseSubCategory[]> {
    return this.http.get<ExpenseSubCategory[]>(ApiRoutes.subCategories.base());
  }

  // POST: api/categories/expense-subcategories
  createSubCategory(dto: ExpenseSubCategoryPayload): Observable<ExpenseSubCategory> {
    return this.http.post<ExpenseSubCategory>(ApiRoutes.subCategories.base(), dto);
  }

  // PUT: api/categories/expense-subcategories/{id}
  updateSubCategory(id: number, dto: ExpenseSubCategoryPayload): Observable<ExpenseSubCategory> {
    return this.http.put<ExpenseSubCategory>(ApiRoutes.subCategories.byId(id), dto);
  }

  // Used by the Is Active switch in the table.
  setActiveSubCategoryStatus(id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(ApiRoutes.subCategories.statusRequestById(id), { isActive });
  }

  // Removes the row. The server refuses (409) if the sub-category is in use.
  deleteSubCategory(id: number): Observable<void> {
    return this.http.delete<void>(ApiRoutes.subCategories.deleteRequestById(id));
  }

  // Income sources
  getIncomeSources(): Observable<IncomeSource[]> {
    return this.http.get<IncomeSource[]>(ApiRoutes.categories.incomeSources());
  }

  createIncomeSource(dto: IncomeSourceCreate): Observable<IncomeSource> {
    return this.http.post<IncomeSource>(ApiRoutes.categories.incomeSources(), dto);
  }

  updateIncomeSource(id: number, dto: IncomeSourceUpdate): Observable<IncomeSource> {
    return this.http.put<IncomeSource>(ApiRoutes.categories.incomeSourceById(id), dto);
  }

  deleteIncomeSource(id: number): Observable<void> {
    return this.http.delete<void>(ApiRoutes.categories.incomeSourceById(id));
  }
}
