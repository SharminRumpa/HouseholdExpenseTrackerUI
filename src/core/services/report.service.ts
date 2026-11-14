// core/services/expense-report.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ExpenseReport, ExpenseReportFilter } from '../../models/expense-report';
import { ApiRoutes } from '../api/api-routes';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExpenseReportService {
  private http = inject(HttpClient);

  //private readonly baseUrl = '/api/reports';
  private baseUrl = `${environment.apiBaseUrl}/reports`;

  getExpenseReport(filter: ExpenseReportFilter): Observable<ExpenseReport> {
    return this.http.get<ExpenseReport>(`${this.baseUrl}/expenses`, {
      params: this.toParams(filter),
    });
  }

  private toParams(filter: ExpenseReportFilter): HttpParams {
    let params = new HttpParams();

    if (filter.fromDate) params = params.set('from', filter.fromDate);
    if (filter.toDate) params = params.set('to', filter.toDate);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.subCategoryId) params = params.set('subCategoryId', filter.subCategoryId);
    if (filter.expenseBy) params = params.set('expenseBy', filter.expenseBy);
    if (filter.expenseFor) params = params.set('expenseFor', filter.expenseFor);
    return params;
  }

  // Same filters as the report; the server builds the .xlsx.
  downloadExpenseReport(filter: ExpenseReportFilter): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/expenses/export`, {
      params: this.toParams(filter),
      responseType: 'blob',
    });
  }

  getExpensePersons(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/expense-persons`);
  }

  getExpenseForPersons(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/expense-for-persons`);
  }
}
