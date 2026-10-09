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
  SubCategory,
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

  getExpenseSubCategories(categoryId: number): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(ApiRoutes.categories.expenseSubCategories(categoryId));
  }

  // Expense Sub categories
  getAllExpenseSubCategories(): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(ApiRoutes.categories.getExpenseSubCategories());
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
