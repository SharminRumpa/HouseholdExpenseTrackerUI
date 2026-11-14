// core/services/account-transaction.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  AccountTransaction,
  AccountTransactionCreate,
  PersonalAccount,
} from '../../models/account-transaction';
import { environment } from '../../environments/environment.development';
import { ResponseDto, ApiResponse } from '../../models/lookup';

// createdAt is stored in UTC, but a datetime2 value usually serializes with no
// "Z"/offset. Browsers read an offset-less ISO string as LOCAL time, which
// would show Bangladesh users a time that is 6 hours early. Mark it as UTC.
function asUtc(value: string): string {
  return /(Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`;
}

// Every endpoint answers with { success, message, data }. If success is false
// (even on HTTP 200) turn it into an error so the callers' error handlers show
// the server's message.
function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || 'Request failed.');
  }
  return response.data;
}

@Injectable({
  providedIn: 'root',
})
export class AccountTransactionService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.apiBaseUrl}/account-transactions`;

  getAll(): Observable<AccountTransaction[]> {
    return this.http.get<ApiResponse<AccountTransaction[]>>(this.baseUrl).pipe(
      map(unwrap), // returns response.data, or throws if success is false
      map((rows) => rows.map((row) => ({ ...row, createdAt: asUtc(row.createdAt) }))),
    );
  }
  // The server inserts the row and recalculates the account balance.
  create(payload: AccountTransactionCreate): Observable<AccountTransaction> {
    return this.http.post<AccountTransaction>(this.baseUrl, payload);
  }

  // Soft delete on the server; the balance is recalculated afterwards.
  delete(transactionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${transactionId}`);
  }

  getAllD(): Observable<PersonalAccount[]> {
    return this.http.get<PersonalAccount[]>(this.baseUrl);
  }
}
