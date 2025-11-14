import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 *
 * Checks if user has a valid securitySessionID
 * - If authenticated: Allow access
 * - If not authenticated: Redirect to /login
 *
 * Protected routes: drugs, drug-doses, drug-questions, checkout
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated (has sessionID)
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    // User has valid session, allow access
    return true;
  } else {
    // User is not authenticated, redirect to login
    console.log('Access denied. Redirecting to login...');
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};
