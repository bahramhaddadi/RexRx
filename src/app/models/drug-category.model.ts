export interface DrugCategory {
  title: string;
  imageUrl: string | null;
  note: string;
  createdAt: string;
  updatedAt: string | null;
  relatedItems: any | null;
  state: number;
  id: number;
  isSerializing: number;
  rowCount: number;
  pageCount: number;
}

export interface GetDrugCategoryListRequest {
  // No fields needed - Authorization header will be added by interceptor
}

export interface ApiResponse<T> {
  errorCode: number;
  errorMessage: string | null;
  body: T;
}
