// import { HttpClient } from '@angular/common/http';
// import { Injectable, inject } from '@angular/core';
// import { Observable, tap } from 'rxjs';
// import { environment } from '../../environments/environment';

// /**
//  * NOTE: the API currently has no /api/auth endpoints (AuthController was
//  * removed — every endpoint is open, no login required). This service and
//  * the login/register pages are kept as a ready-to-wire skeleton for if/when
//  * authentication is reintroduced on the backend: point LoginRequest/
//  * RegisterRequest at your future AuthController DTOs and this will work
//  * as-is. Until then, isLoggedIn() always returns true and AuthGuard never
//  * blocks navigation.
//  */

// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface RegisterRequest {
//   name: string;
//   email: string;
//   mobileNumber?: string;
//   password: string;
//   roleName?: string;
// }

// export interface LoginResponse {
//   token: string;
//   expiresAt: string;
//   userId: number;
//   name: string;
//   email: string;
//   roleName: string;
// }

// export interface UserSession {
//   userId: number;
//   userName: string;
//   roleName: string; // 'Admin', 'Member', 'Viewer'
//   permissions: string[]; // e.g. ['Dashboard.View', 'Income.View', ...]
// }

// const TOKEN_KEY = 'het_token';
// const USER_KEY = 'het_user';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private http = inject(HttpClient);
//   private baseUrl = `${environment.apiBaseUrl}/auth`;

//   login(request: LoginRequest): Observable<LoginResponse> {
//     return this.http
//       .post<LoginResponse>(`${this.baseUrl}/login`, request)
//       .pipe(tap((res) => this.persistSession(res)));
//   }

//   register(request: RegisterRequest): Observable<LoginResponse> {
//     return this.http
//       .post<LoginResponse>(`${this.baseUrl}/register`, request)
//       .pipe(tap((res) => this.persistSession(res)));
//   }

//   logout(): void {
//     localStorage.removeItem(TOKEN_KEY);
//     localStorage.removeItem(USER_KEY);
//   }

//   getToken(): string | null {
//     return localStorage.getItem(TOKEN_KEY);
//   }

//   getCurrentUser(): LoginResponse | null {
//     const raw = localStorage.getItem(USER_KEY);
//     return raw ? (JSON.parse(raw) as LoginResponse) : null;
//   }

//   isLoggedIn(): boolean {
//     // Backend has no auth right now — always treat the visitor as allowed.
//     // Swap for `return !!this.getToken();` once AuthController is back.
//     return true;
//   }

//   private persistSession(res: LoginResponse): void {
//     localStorage.setItem(TOKEN_KEY, res.token);
//     localStorage.setItem(USER_KEY, JSON.stringify(res));
//   }

//   hasPermission(permission: string): boolean {
//     const user = this.getCurrentUser();
//     console.log('Checking permission:', permission, 'for user:', user);
//     if (!user) return false;
//     return true; // Always allow for now, since backend has no auth. Swap for the line below once AuthController is back.

//     //return user.permissions.includes(permission);
//   }
// }

// src/core/services/auth.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse, MenuItem } from '../../models/auth.model';

const STORAGE_KEY = 'auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  menuItems = signal<MenuItem[]>([]);
  isLoaded = signal<boolean>(false);

  // Seeded from storage so a page refresh doesn't log the user out.
  currentUser = signal<AuthUser | null>(this.readFromStorage());

  isAuthenticated = computed(() => {
    const user = this.currentUser();
    return !!user && new Date(user.expiresAt).getTime() > Date.now();
  });

  get token(): string | null {
    return this.currentUser()?.token ?? null;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => this.setUser(response))
    
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private setUser(response: LoginResponse): void {
    const user: AuthUser = {
      userId: response.userId,
      name: response.name,
      email: response.email,
      roleName: response.roleName,
      token: response.token,
      expiresAt: response.expiresAt
    };

    this.currentUser.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private readFromStorage(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  loadMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/menu`).pipe(
      tap((items) => {
        this.menuItems.set(items);
        this.isLoaded.set(true);
      })
    );
  }
 
  // Called on logout so a second user on the same browser never
  // momentarily sees the previous user's sidebar.
  clear(): void {
    this.menuItems.set([]);
    this.isLoaded.set(false);
  }
}