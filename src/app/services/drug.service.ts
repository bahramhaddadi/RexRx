import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Drug, GetDrugListRequest } from '../models/drug.model';
import { ApiResponse } from '../models/drug-category.model';

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  private readonly apiService = inject(ApiService);

  /**
   * Generates a random security session ID
   * TODO: Replace with actual token from authentication service in the future
   */
  private generateSecuritySessionID(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Fetches the list of drugs from the API
   * @param categoryId Optional category ID to filter drugs
   * @returns Observable of API response containing drugs array
   */
  getDrugList(categoryId?: number): Observable<ApiResponse<Drug[]>> {
    const request: GetDrugListRequest = {
      securitySessionID: this.generateSecuritySessionID(),
      body: null
    };

    return this.apiService.post<ApiResponse<Drug[]>>(
      '/Pharma/Drug/GetDrugList',
      request
    );
  }
}
