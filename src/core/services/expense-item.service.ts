// core/services/expense-item.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ExpenseItem, ExpenseItemPayload } from '../../models/expense-item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExpenseItemService {
  private http = inject(HttpClient);

  //private readonly baseUrl = '/api/expense-items';
  private baseUrl = `${environment.apiBaseUrl}/categories/expense-items`;

  getAll(): Observable<ExpenseItem[]> {
    return this.http.get<ExpenseItem[]>(this.baseUrl);
  }

  create(payload: ExpenseItemPayload): Observable<ExpenseItem> {
    return this.http.post<ExpenseItem>(this.baseUrl, payload);
  }

  update(expenseItemId: number, payload: ExpenseItemPayload): Observable<ExpenseItem> {
    return this.http.put<ExpenseItem>(`${this.baseUrl}/${expenseItemId}`, payload);
  }

  // Soft delete on the server (IsActive = false) — the row stays in the list
  // with an "Inactive" badge and can be reactivated from the edit form.
  delete(expenseItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${expenseItemId}`);
  }
}
