// src/app/core/services/role.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiRoutes } from '../api/api-routes';

export interface Role {
  roleId: number;
  roleName: string;
}

export interface RolePermission {
  permissionCode: string;
  permissionName: string;
  route?: string | null;
  icon?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(ApiRoutes.role.base());
  }

  getPermissions(roleId: number): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(ApiRoutes.role.permissions(roleId));
  }
}