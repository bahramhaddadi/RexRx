export interface Drug {
  eid: string;
  title: string;
  brandName: string;
  note: string;
  isGeneric: boolean;
  categoryID: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string | null;
  relatedCategory: any | null;
  relatedQuestionnairs: any[];
  dosages: any[];
  state: number;
  id: number;
  isSerializing: number;
  rowCount: number;
  pageCount: number;
}

export interface GetDrugListRequest {
  securitySessionID: string;
  body: null;
}
