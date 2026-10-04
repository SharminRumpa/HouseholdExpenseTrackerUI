export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: number;
  name: string;
  email: string;
  roleName: string;
}

// What's actually kept in memory/storage — same data, named for what it is
// here rather than what the API call was.
export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  roleName: string;
  token: string;
  expiresAt: string;
}

export interface MenuItem {
  id: number;
  title: string;
  icon: string | null;
  route: string | null;
  permissions: string[];
}


export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto{
  token: string;
  expiresAt: string;
  userId: number;
  name: string;
  email: string;
  roleName: string;
  menuItems: MenuItem[];
}


