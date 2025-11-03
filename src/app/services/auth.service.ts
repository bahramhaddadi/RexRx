import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly AUTH_ENDPOINT = '/Pharma/Security/Authenticate';
  private readonly SESSION_STORAGE_KEY = 'pharma_session';

  private sessionSubject = new BehaviorSubject<AuthResponse | null>(null);
  public session$ = this.sessionSubject.asObservable();

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
    this.sessionSubject.next(session);
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
        this.sessionSubject.next(session);
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
    return this.sessionSubject.value;
  }

  /**
   * Get the session ID
   * @returns Session ID or null
   */
  getSessionId(): string | null {
    return this.sessionSubject.value?.sessionID || null;
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return !!this.sessionSubject.value?.sessionID;
  }

  /**
   * Clear the current session (logout)
   */
  clearSession(): void {
    this.sessionSubject.next(null);
    sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
  }

  /**
   * Logout the user
   */
  logout(): void {
    this.clearSession();
  }
}
