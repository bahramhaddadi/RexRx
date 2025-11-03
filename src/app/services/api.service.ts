import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = environment.apiBaseUrl;

  /**
   * GET request
   * @param endpoint - API endpoint (will be appended to base URL)
   * @param params - Optional query parameters
   * @returns Observable with response data
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params });
  }

  /**
   * POST request
   * @param endpoint - API endpoint (will be appended to base URL)
   * @param body - Request body
   * @returns Observable with response data
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  /**
   * PUT request
   * @param endpoint - API endpoint (will be appended to base URL)
   * @param body - Request body
   * @returns Observable with response data
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint (will be appended to base URL)
   * @param body - Request body
   * @returns Observable with response data
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body);
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint (will be appended to base URL)
   * @returns Observable with response data
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }

  /**
   * Get the full URL for a given endpoint
   * @param endpoint - API endpoint
   * @returns Full URL
   */
  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}
