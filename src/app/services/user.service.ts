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
  ShippingAddress
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
   * @returns Observable of user addresses array
   */
  getUserAddresses(): Observable<UserAddress[]> {
    return this.apiService.post<UserAddress[]>(
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
   * Fetches shipping addresses for the user
   * @returns Observable of shipping addresses array
   */
  getShippingAddresses(): Observable<ShippingAddress[]> {
    return this.apiService.post<ShippingAddress[]>(
      '/Pharma/User/GetShippingAddresses',
      {}
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
}
