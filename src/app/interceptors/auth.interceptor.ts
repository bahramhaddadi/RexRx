import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const session = authService.getSession();

  // Skip adding Authorization header for authentication endpoints
  const isAuthEndpoint = req.url.includes('/Security/Authenticate') ||
                         req.url.includes('/Security/Signup') ||
                         req.url.includes('/Security/GetCaptcha');

  // If user is authenticated and it's not an auth endpoint, add Authorization header
  if (session?.sessionID && !isAuthEndpoint) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.sessionID}`
      }
    });

    return next(clonedRequest).pipe(
      tap({
        error: (error) => {
          // Handle 401 Unauthorized - redirect to home page
          if (error.status === 401) {
            authService.logout();
            router.navigate(['/']);
          }
        }
      })
    );
  }

  return next(req);
};
