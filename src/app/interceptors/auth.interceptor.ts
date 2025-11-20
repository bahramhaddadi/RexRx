import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const session = authService.getSession();

  // Skip adding Authorization header for authentication endpoints
  const isAuthEndpoint = req.url.includes('/Security/Authenticate') ||
                         req.url.includes('/Security/Signup') ||
                         req.url.includes('/Security/GetCaptcha');

  // If user is authenticated and it's not an auth endpoint, add Authorization header
  if (session?.sessionID && !isAuthEndpoint) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: session.sessionID
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
