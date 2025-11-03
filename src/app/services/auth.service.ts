import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly AUTH_ENDPOINT = '/Pharma/Security/Authenticate';
  private readonly SESSION_STORAGE_KEY = 'pharma_session';

  // Modern Angular 17: Use signal instead of BehaviorSubject
  private sessionSignal = signal<AuthResponse | null>(null);

  // Public read-only signal
  public readonly session = this.sessionSignal.asReadonly();

  // Computed signals for common checks
  public readonly isAuthenticated = computed(() => !!this.sessionSignal()?.sessionID);
  public readonly sessionId = computed(() => this.sessionSignal()?.sessionID || null);

  constructor() {
    // Load session from storage on initialization
    this.loadSessionFromStorage();
  }

  /**
   * Authenticate user with email, password, and CAPTCHA
   * @param authData - Authentication credentials
   * @returns Observable with authentication response
   */
  authenticate(authData: AuthRequest): Observable<AuthResponse> {
    // API expects an array: [email, password, refId, captchaCode]
    const requestBody = [
      authData.email,
      authData.password,
      authData.refId,
      authData.captchaCode
    ];

    return this.apiService.post<AuthResponse>(this.AUTH_ENDPOINT, requestBody).pipe(
      tap(response => {
        // Check if authentication was successful
        if (response.exceptionCode === 0) {
          this.setSession(response);
        }
      })
    );
  }

  /**
   * Set the current session
   * @param session - Session data
   */
  private setSession(session: AuthResponse): void {
    this.sessionSignal.set(session);
    sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Load session from storage
   */
  private loadSessionFromStorage(): void {
    const storedSession = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        this.sessionSignal.set(session);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        this.clearSession();
      }
    }
  }

  /**
   * Get the current session
   * @returns Current session or null
   */
  getSession(): AuthResponse | null {
    return this.sessionSignal();
  }

  /**
   * Get the session ID (deprecated - use sessionId signal instead)
   * @returns Session ID or null
   * @deprecated Use sessionId computed signal instead
   */
  getSessionId(): string | null {
    return this.sessionSignal()?.sessionID || null;
  }

  /**
   * Clear the current session (logout)
   */
  clearSession(): void {
    this.sessionSignal.set(null);
    sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
  }

  /**
   * Logout the user
   */
  logout(): void {
    this.clearSession();
  }
}
