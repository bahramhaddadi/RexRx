import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DrugCategory,
  GetDrugCategoryListRequest,
  ApiResponse
} from '../models/drug-category.model';

@Injectable({
  providedIn: 'root'
})
export class DrugCategoryService {
  constructor(private apiService: ApiService) {}

  /**
   * Generates a random security session ID
   * TODO: Replace with actual token from authentication service in the future
   */
  private generateSecuritySessionID(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Fetches the list of drug categories from the API
   * @returns Observable of API response containing drug categories array
   */
  getDrugCategoryList(): Observable<ApiResponse<DrugCategory[]>> {
    const request: GetDrugCategoryListRequest = {
      securitySessionID: this.generateSecuritySessionID()
    };

    return this.apiService.post<ApiResponse<DrugCategory[]>>(
      '/Pharma/Drug/GetDrugCategoryList',
      request
    );
  }
}
