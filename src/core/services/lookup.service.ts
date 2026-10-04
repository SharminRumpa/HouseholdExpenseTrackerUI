import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DropdownItem, ExpenseSubCategoryDropdown } from '../../models/lookup';
import { ApiRoutes } from '../api/api-routes';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class LookupService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.apiBaseUrl}/lookup`;

  getIncomeCategories(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.baseUrl}/income-categories`);
  }

  getIncomeSources(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.baseUrl}/income-sources`);
  }

  getExpenseCategories(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.baseUrl}/expense-categories`);
  }

  getExpenseItems(expenseSubCategoryId: number): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(
      `${this.baseUrl}/expense-items`,
      { params: { expenseSubCategoryId } }
    );
  }

  getExpenseSubCategories(expenseCategoryId?: number | null): Observable<ExpenseSubCategoryDropdown[]> {
    let params = new HttpParams();

    if (expenseCategoryId) {
      params = params.set('expenseCategoryId', expenseCategoryId);
    }

    return this.http.get<ExpenseSubCategoryDropdown[]>(`${this.baseUrl}/expense-subcategories`, { params });
  }

  getRoles(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.baseUrl}/roles`);
  }

}

