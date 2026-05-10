export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface UserInfo {
  userId: number;
  email: string;
  role: string;
  fullName: string;
}
