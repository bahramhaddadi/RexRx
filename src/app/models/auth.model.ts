/**
 * CAPTCHA response model
 */
export interface CaptchaResponse {
  refId: string;
  imageBase64: string;
}

/**
 * Authentication request model
 * API expects an array: [email, password, refId, captchaCode]
 */
export interface AuthRequest {
  email: string;
  password: string;
  refId: string;
  captchaCode: string;
}

/**
 * Authentication response model
 */
export interface AuthResponse {
  sessionID: string;
  createTime: string;
  lastActivityTime: string;
  lastActivity: string;
  username: string;
  userID: number;
  exceptionCode: number;
  exceptionMessage: string | null;
}

/**
 * Sign-up request model
 */
export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;  // Format: YYYY-MM-DD
  howDidYouFindUs: string;
  captcha: string;
  captchaRef: string;
}

/**
 * Sign-up response model
 */
export interface SignUpResponse {
  errorCode: number;
  errorMessage: string | null;
  success?: boolean;
}
