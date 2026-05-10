import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Don't add token for auth endpoints
  if (req.url.includes('/api/auth/')) {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Auth error:', error);
        return throwError(() => error);
      })
    );
  }

  // Add JWT token to other requests
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid
          authService.logout();
          // Optionally redirect to login
          window.location.href = '/auth/login';
        }
        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('API error:', error);
      return throwError(() => error);
    })
  );
};
