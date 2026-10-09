import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseSearchFilter,
  ExpenseDeleteRequest,
} from '../../models/expense';
import { ResponseDto } from '../../models/lookup';
import { ApiRoutes } from '../api/api-routes';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/expense`;
  private deleteRequestBaseUrl = `${environment.apiBaseUrl}/expense/delete`;

  getAll(filter: ExpenseSearchFilter): Observable<Expense[]> {
    let params = new HttpParams();
    if (filter.fromDate) params = params.set('from', filter.fromDate);
    if (filter.toDate) params = params.set('to', filter.toDate);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    return this.http.get<Expense[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.baseUrl}/${id}`);
  }

  create(dto: ExpenseCreate): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, dto);
  }

  update(id: number, dto: ExpenseUpdate): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // #region ExpenseDeleteRequests

  createExpenseDeleteRequest(dto: ExpenseDeleteRequest): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(`${this.baseUrl}/expense-delete-requests`, dto);
  }

  getExpenseDeleteRequestById(
    expenseId: number,
  ): Observable<{ expenseId: number; reason: string; status: string }> {
    return this.http.get<{ expenseId: number; reason: string; status: string }>(
      `${this.deleteRequestBaseUrl}/${expenseId}`,
    );
  }

  deleteExpenseDeleteRequest(expenseId: number): Observable<void> {
    return this.http.delete<void>(`${this.deleteRequestBaseUrl}/${expenseId}`);
  }

  // #endregion
}
