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
  SubCategory
} from '../../models/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  // Income categories
  getIncomeCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(ApiRoutes.category.incomeCategories());
  }

  createIncomeCategory(dto: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(ApiRoutes.category.incomeCategories(), dto);
  }

  updateIncomeCategory(id: number, dto: CategoryUpdate): Observable<Category> {
 
    return this.http.put<Category>(ApiRoutes.category.incomeCategoryById(id), dto);
  }

  deleteIncomeCategory(id: number): Observable<void> {

    return this.http.delete<void>(ApiRoutes.category.incomeCategoryById(id));
  }

  // Expense categories
  getExpenseCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(ApiRoutes.category.expenseCategories());
  }

  updateExpenseCategory(id: number, dto: CategoryUpdate): Observable<Category> {
    return this.http.put<Category>(ApiRoutes.category.expenseCategoryById(id), dto);
  }

  deleteExpenseCategory(id: number): Observable<void> {
    return this.http.delete<void>(ApiRoutes.category.expenseCategoryById(id));
  }

  getExpenseSubCategories(categoryId: number): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(ApiRoutes.category.expenseSubCategories(categoryId));
  }

  // Expense Sub categories
  getAllExpenseSubCategories(): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(ApiRoutes.category.getExpenseSubCategories());
  }


  // Income sources
  getIncomeSources(): Observable<IncomeSource[]> {
    return this.http.get<IncomeSource[]>(ApiRoutes.category.incomeSources());
  }

  createIncomeSource(dto: IncomeSourceCreate): Observable<IncomeSource> {
    return this.http.post<IncomeSource>(ApiRoutes.category.incomeSources(), dto);
  }

  updateIncomeSource(id: number, dto: IncomeSourceUpdate): Observable<IncomeSource> {
    return this.http.put<IncomeSource>(ApiRoutes.category.incomeSourceById(id), dto);
  }

  deleteIncomeSource(id: number): Observable<void> {
    return this.http.delete<void>(ApiRoutes.category.incomeSourceById(id));
  }
}