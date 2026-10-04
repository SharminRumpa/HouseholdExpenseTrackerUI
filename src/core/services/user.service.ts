import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserCreate, UserUpdate } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/user`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  update(id: number, dto: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  create(user: UserCreate): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }
}
