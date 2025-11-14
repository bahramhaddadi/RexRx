export interface Drug {
  eid: string;
  title: string;
  brandName: string;
  note: string;
  imageURL: string;
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

export interface Question {
  questionnairID: number;
  nextQuestionID: number | null;
  questionTypeID: number;
  title: string;
  note: string;
  imageURL: string;
  relatedQuestionType: any | null;
  nextQuestion: any | null;
  relatedQuestionnair: any | null;
  questionChoices: QuestionChoice[];
  state: number;
  id: number;
  isSerializing: number;
  rowCount: number;
  pageCount: number;
}

export interface QuestionChoice {
  title: string;
  questionID: number;
  nextQuestionID: number | null;
  hasExtraInfo: boolean;
  extraInfoTitle: string | null;
  imageURL: string | null;
  relatedQuestion: any | null;
  relatedNextQuestion: any | null;
  state: number;
  id: number;
  isSerializing: number;
  rowCount: number;
  pageCount: number;
}

export interface GetQuestionsRequest {
  securitySessionID: string;
  body: string; // Drug eid
}

export interface GetChoicesRequest {
  securitySessionID: string;
  body: number; // Question ID
}
