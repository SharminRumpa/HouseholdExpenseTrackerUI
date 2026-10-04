import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Income, IncomeCreate, IncomeUpdate, IncomeSearchFilter } from '../../models/income';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/income`;

  // getAll(filters?: { from?: string; to?: string; categoryId?: number }): Observable<Income[]> {
  //   let params = new HttpParams();
  //   if (filters?.from) params = params.set('from', filters.from);
  //   if (filters?.to) params = params.set('to', filters.to);
  //   if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
  //   return this.http.get<Income[]>(this.baseUrl, { params });
  // }
  getAll(filter: IncomeSearchFilter): Observable<Income[]> {
    let params = new HttpParams();
 
    if (filter.fromDate) params = params.set('from', filter.fromDate);
    if (filter.toDate) params = params.set('to', filter.toDate);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
 
    return this.http.get<Income[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Income> {
    return this.http.get<Income>(`${this.baseUrl}/${id}`);
  }

  create(dto: IncomeCreate): Observable<Income> {
    return this.http.post<Income>(this.baseUrl, dto);
  }

  update(id: number, dto: IncomeUpdate): Observable<Income> {
    return this.http.put<Income>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // getCategoryOptions(): Observable<IncomeCategoryOption[]> {
  //   return this.http.get<IncomeCategoryOption[]>(this.categoriesUrl);
  //}
}
