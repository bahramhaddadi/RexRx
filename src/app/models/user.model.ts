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

/**
 * Get user addresses response
 */
export interface GetUserAddressesResponse {
  body: UserAddress[];
  errorCode: number;
  errorMessage: string | null;
}

/**
 * Autocomplete address request model
 */
export interface AutocompleteAddressRequest {
  body: string;
}

/**
 * Autocomplete address item
 */
export interface AutocompleteAddressItem {
  fullAddress: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

/**
 * Autocomplete address response
 */
export interface AutocompleteAddressResponse {
  body: AutocompleteAddressItem[];
  errorCode: number;
  errorMessage: string | null;
}

/**
 * Shipping address item (extended from UserAddress)
 */
export interface ShippingAddress extends UserAddress {
  id: number;
}

/**
 * Order item model
 */
export interface OrderItem {
  itemName: string;
  quantity: number;
  dose: string;
}

/**
 * Order model
 */
export interface Order {
  id: string;
  orderDate: string;
  orderStatus: number;
  statusName: string;
  drugs: string;
  shippingStatusURL: string;
  doctorAction: string;
  pharmacistAction: string;
  shippingAddress: string | null;
  total: number;

  trackingNumber: string | null;
  items: OrderItem[];
}

/**
 * Get orders request model
 */
export interface GetOrdersRequest {
  orderStatus: number;
  searchCriteria: string;
  pageNumber: number;
  pageSize: number;
}

/**
 * Get orders response
 */
export interface GetOrdersResponse {
  body: {
    list: Order[];
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
  };
  errorCode: number;
  errorMessage: string | null;
}

/**
 * Government ID document type
 */
export enum GovernmentIdType {
  HEALTH_CARD = 'HC',
  DRIVING_LICENSE = 'DL'
}

/**
 * Government ID document side
 */
export enum GovernmentIdSide {
  FRONT = 'F',
  BACK = 'B'
}

/**
 * Government ID upload status
 */
export interface GovernmentIdStatus {
  healthCardFront: string | null;
  healthCardBack: string | null;
  drivingLicenseFront: string | null;
  drivingLicenseBack: string | null;
}

/**
 * Upload image response
 */
export interface UploadImageResponse {
  result: string;
}

/**
 * Medical history request model
 */
export interface UpdateMedicalHistoryRequest {
  allergies: string;
  medications: string;
  surgeries: string;
  otherConditions: string;
}

/**
 * Medical history data model
 */
export interface MedicalHistoryData {
  allergies: string;
  medications: string;
  surgeries: string;
  otherConditions: string;
}

/**
 * Get medical history response
 */
export interface GetMedicalHistoryResponse {
  errorCode: number;
  errorMessage: string | null;
  body: MedicalHistoryData;
}

/**
 * Update medical history response
 */
export interface UpdateMedicalHistoryResponse {
  errorCode: number;
  errorMessage: string | null;
  body: string;
}
