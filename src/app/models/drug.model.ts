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

export interface DrugDose {
  itemId: string;
  dose: string;
  quantityInPack: number;
  price: number;
  imageUrl: string;
  state: number;
  id: number;
  isSerializing: number;
  rowCount: number;
  pageCount: number;
}

export interface GetItemDoseListRequest {
  securitySessionID: string;
  body: string; // Drug eid
}
