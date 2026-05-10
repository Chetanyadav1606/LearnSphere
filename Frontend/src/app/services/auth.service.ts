import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, UserInfo } from '../models/auth.models';
import { apiUrl } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly AUTH_API = apiUrl('/auth');
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'auth-user';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.AUTH_API}/login`, credentials, { responseType: 'text' }).pipe(
      tap(token => {
        // Backend returns plain text: either a JWT token or an error message like "Invalid email"
        if (!token || token.includes('Invalid') || token.includes('Error') || !token.includes('.')) {
          throw new Error(token || 'Login failed');
        }
        localStorage.setItem(this.TOKEN_KEY, token);
        // Decode JWT to extract user info
        const userInfo = this.decodeToken(token);
        if (userInfo) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
        }
      })
    );
  }

  register(request: any): Observable<any> {
    return this.http.post<any>(`${this.AUTH_API}/register`, request);
  }

  activateAccount(code: string): Observable<any> {
    return this.http.post<any>(`${this.AUTH_API}/activate`, { code });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): UserInfo | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string {
    return this.getUser()?.role ?? '';
  }

  isInstructor(): boolean {
    return this.getUserRole() === 'INSTRUCTOR';
  }

  isStudent(): boolean {
    return this.getUserRole() === 'STUDENT';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  // Helper method to decode JWT token
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }
}
