import { Injectable, inject } from '@angular/core';
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
  private readonly apiService = inject(ApiService);

  /**
   * Fetches the list of drug categories from the API
   * @returns Observable of API response containing drug categories array
   */
  getDrugCategoryList(): Observable<ApiResponse<DrugCategory[]>> {
    const request: GetDrugCategoryListRequest = {
      // Authorization header will be added by interceptor
    };

    return this.apiService.post<ApiResponse<DrugCategory[]>>(
      '/Pharma/Drug/GetDrugCategoryList',
      request
    );
  }
}
