export interface User {
  userId: number;
  name: string;
  email: string;
  mobileNumber?: string | null;
  roleId: number;
  roleName: string;
  createdAt: string;
  lastUpdatedAt?: string | null;
}

export interface UserCreate {
  name: string;
  email: string;
  mobileNumber?: string | null;
  password: string;
  roleId: number;
}

export interface UserUpdate {
  name: string;
  email: string;
  mobileNumber?: string | null;
  roleId: number;
  password?: string; // omit/blank to keep the current password
}


