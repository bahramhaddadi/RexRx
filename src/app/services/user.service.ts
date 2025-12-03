import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  UserProfile,
  GetUserProfileV2Response,
  UpdatePersonalInfoRequest,
  UserAddress,
  CreateUserAddressRequest,
  UpdateUserAddressRequest,
  ApiResponse,
  AutocompleteAddressRequest,
  AutocompleteAddressResponse,
  GetUserAddressesResponse,
  GetOrdersRequest,
  GetOrdersResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiService = inject(ApiService);

  /**
   * Fetches the user profile information
   * @returns Observable of user profile response with error handling
   */
  getUserProfile(): Observable<GetUserProfileV2Response> {
    return this.apiService.post<GetUserProfileV2Response>(
      '/Pharma/User/GetUserProfileV2',
      { body: null }
    );
  }

  /**
   * Updates the user's personal information
   * @param data The personal info data to update
   * @returns Observable of API response
   */
  updatePersonalInfo(data: UpdatePersonalInfoRequest): Observable<ApiResponse> {
    return this.apiService.post<ApiResponse>(
      '/Pharma/User/UpdatePersonalInfo',
      data
    );
  }

  /**
   * Fetches the user's shipping addresses
   * @returns Observable of user addresses response
   */
  getUserAddresses(): Observable<GetUserAddressesResponse> {
    return this.apiService.post<GetUserAddressesResponse>(
      '/Pharma/User/GetUserAddresses',
      {}
    );
  }

  /**
   * Creates a new user address
   * @param address The address data to create
   * @returns Observable of API response
   */
  createUserAddress(address: CreateUserAddressRequest): Observable<ApiResponse> {
    return this.apiService.post<ApiResponse>(
      '/Pharma/User/CreateUserAddress',
      address
    );
  }

  /**
   * Updates an existing user address
   * @param address The address data to update (must include id)
   * @returns Observable of API response
   */
  updateUserAddress(address: UpdateUserAddressRequest): Observable<ApiResponse> {
    return this.apiService.post<ApiResponse>(
      '/Pharma/User/UpdateUserAddress',
      address
    );
  }

  /**
   * Autocompletes address based on search text
   * @param searchText The text to search for (street address)
   * @returns Observable of autocomplete address response
   */
  autocompleteAddress(searchText: string): Observable<AutocompleteAddressResponse> {
    const request: AutocompleteAddressRequest = {
      body: searchText
    };

    return this.apiService.post<AutocompleteAddressResponse>(
      '/Pharma/Shopping/AutocompleteAddress',
      request
    );
  }

  /**
   * Fetches user orders with pagination and search
   * @param orderStatus The order status filter (0 for all)
   * @param searchCriteria The search text filter
   * @param pageNumber The page number (0-indexed)
   * @param pageSize The number of items per page
   * @returns Observable of orders response
   */
  getOrders(
    orderStatus: number = 0,
    searchCriteria: string = '',
    pageNumber: number = 0,
    pageSize: number = 10
  ): Observable<GetOrdersResponse> {
    const request: GetOrdersRequest = {
      orderStatus,
      searchCriteria,
      pageNumber,
      pageSize
    };

    return this.apiService.post<GetOrdersResponse>(
      '/Pharma/User/GetOrders',
      { body: request }
    );
  }
}
