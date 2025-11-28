/**
 * User profile response model (from GetUserProfileV2)
 */
export interface UserProfile {
  eid: string;
  email: string;
  password: string | null;
  salt: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: string; // ISO format: "1999-03-23T00:00:00"
  gender: string;
  allergies: string;
  medications: string;
  surgeries: string;
  otherConditions: string;
  hasVerified: boolean;
  isActive: boolean;
  creationDate: string;
  resetPasswordUUID: string;
  resetPasswordDate: string | null;
  relatedCategory: any | null;
  relatedShoppingCart: any | null;
  state: number;
  id: number;
  isSerializing: number;
  rowCount: number;
  pageCount: number;
}

/**
 * Get user profile request/response wrapper
 */
export interface GetUserProfileV2Response {
  body: UserProfile;
  errorCode: number;
  errorMessage: string | null;
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
