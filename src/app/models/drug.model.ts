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

// Question Type Enum
export enum QuestionType {
  SingleChoice = 1,           // Radio buttons - must select one
  MultipleChoice = 2,         // Checkboxes - must select at least one
  MultipleChoiceWithNone = 3, // Checkboxes - "None of these apply" option
  FormFill = 4,              // Text input fields
  Terminate = 5,             // User cannot get this drug
  LastQuestion = 10          // Last question marker
}

export interface Question {
  questionnairID: number;
  nextQuestionID: number | null;
  questionTypeID: QuestionType;
  questionType: QuestionType;
  title: string;
  note: string;
  imageURL: string | null;
  relatedQuestionType: any | null;
  nextQuestion: any | null;
  relatedQuestionnaire: any | null;
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

export interface PlaceholderItem {
  doseID: number;
  eid: string;
  title: string | null;
  brandName: string | null;
  note: string | null;
  isGeneric: boolean;
  categoryID: number;
  categoryName: string | null;
  imageURL: string | null;
  createdAt: string;
  updatedAt: string | null;
  relatedCategory: any | null;
  relatedQuestionnaires: any[];
  dosages: any[];
  state: number;
  id: number;
  isSerializing: number;
  rowCount: number;
  pageCount: number;
}

export interface GetPlaceHolderItemRequest {
  securitySessionID: string;
  body: number; // Category ID
}

export interface GetDrugsByCategoryRequest {
  securitySessionID: string;
  categoryID: number;
  searchCriteria: string;
}

export interface GetRecommendedDrugsRequest {
  securitySessionID: string;
  body: number; // ItemDoseID
}

export interface GetFirstQuestionRequest {
  securitySessionID: string;
  body: string; // ItemID (eid)
}

export interface QuestionWithAnswer {
  Id: number;
  QuestionnairID: number;
  NextQuestionID: number | null;
  QuestionTypeID: QuestionType;
  Title: string;
  Note: string;
  QuestionChoices: QuestionChoiceAnswer[];
}

export interface QuestionChoiceAnswer {
  HasExtraInfo: boolean;
  ExtraInfoTitle: string | null;
  NextQuestionID: number | null;
  Id: number;
}

export interface GetNextQuestionRequest {
  securitySessionID: string;
  body: QuestionWithAnswer;
}

export interface QuestionnaireAnswer {
  questionId: number;
  choiceId: number;
  extraText: string;
}

export interface CartItem {
  itemDosageId: number;
  quantity: number;
  questionnaireAnswers: QuestionnaireAnswer[];
}

export interface SaveCart2Body {
  isPatientSameAsUser: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: string;
  phone: string;
  weight: string;
  birthDate: string;
  healthCardNumber: string;
  allergies: string;
  medications: string;
  surgeries: string;
  otherMedicalConditions: string;
  orderDate: string;
  promoCode: string;
  items: CartItem[];
}

export interface SaveCart2Request {
  securitySessionID: string;
  body: SaveCart2Body;
}
