import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guest Guard - Prevents authenticated users from accessing guest-only routes
 *
 * Checks if user has a valid securitySessionID
 * - If authenticated: Redirect to /home
 * - If not authenticated: Allow access
 *
 * Guest-only routes: login, sign-up
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated (has sessionID)
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    // User is already logged in, redirect to home
    console.log('Already authenticated. Redirecting to home...');
    router.navigate(['/']);
    return false;
  } else {
    // User is not authenticated, allow access to login/signup
    return true;
  }
};
