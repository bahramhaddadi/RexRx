/**
 * User profile response model
 */
export interface UserProfile {
  userID: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  // Add other fields as returned by the API
}

/**
 * Update personal info request model
 */
export interface UpdatePersonalInfoRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
}

/**
 * User address model
 */
export interface UserAddress {
  id?: number;
  nickName: string;
  streetAddress1: string;
  streetAddress2?: string;
  apartmentNumber?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

/**
 * Create user address request model
 */
export interface CreateUserAddressRequest {
  nickName: string;
  streetAddress1: string;
  streetAddress2?: string;
  apartmentNumber?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

/**
 * Update user address request model
 */
export interface UpdateUserAddressRequest {
  id: number;
  nickName: string;
  streetAddress1: string;
  streetAddress2?: string;
  apartmentNumber?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

/**
 * Generic API response
 */
export interface ApiResponse {
  exceptionCode: number;
  exceptionMessage: string | null;
  success?: boolean;
}
