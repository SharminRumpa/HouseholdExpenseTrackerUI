import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment} from '../../environments/environment';
import { DashboardSummary } from '../../models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/dashboard`;

  getSummary(year: number, month: number): Observable<DashboardSummary> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<DashboardSummary>(`${this.baseUrl}/summary`, { params });
  }
}
