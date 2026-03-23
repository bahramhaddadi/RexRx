export interface Drug {
  eid: string;
  title: string;
  brandName: string;
  note: string;
  imageURL: string;
  infoURL: string;
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
  body: null;
}

export interface DrugDose {
  itemId: string;
  dose: string;
  quantityInPack: number;
  price: number;
  hst: number;
  imageUrl: string;
  state: number;
  id: number;
  isSerializing: number;
  rowCount: number;
  pageCount: number;
}

export interface GetItemDoseListRequest {
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

export interface UserQuestion {
  id: number;
  questionTypeID: number;  
  title: string;
  note: string;
  imageURL: string | null;
  questionChoices: UserQuestionChoice[];
}

export interface UserQuestionChoice {
  id: number;
  title: string;
  hasExtraInfo: boolean;
  extraInfoTitle: string | null;
  imageURL: string | null;
}

export interface UserQuestionsToGetNextQuestion {
  questionId: number;
  answers: UserAnswerToGetNextQuestion[];
}

export interface UserAnswerToGetNextQuestion {
  id: number;
  extraInfo: string | null;
}


export interface GetQuestionsRequest {
  body: string; // Drug eid
}

export interface GetChoicesRequest {
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
  body: number; // Category ID
}

export interface GetDrugsByCategoryRequest {
  categoryID: number;
  searchCriteria: string;
}

export interface RelatedDrug {
  selected: boolean;
  id: string;
  categoryId: number;
  categoryName: string;
  brandName: string;
  title: string;
  note: string;
  isActive: boolean;
  isGeneric: boolean;
  imageUrl: string;
  dose: string;
  doseId: number;
  qtyInPack: number;
  price: number;
  hst: number;
  questionId: number;
  itemNameAndDose: string;
}

export interface GetRecommendedDrugsRequest {
  body: QuestionnaireAnswer[]; // Array of questionnaire answers
}

// Related items (upsell) request/response
export interface GetRelatedItemsRequest {
  body: number; // ItemDoseID
}

export interface GetFirstQuestionRequest {
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
  body: UserQuestionsToGetNextQuestion;
}

export interface GetQuestionByIdRequest {
  body: number;
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

export interface SaveCartV2Body {
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

export interface SaveCartV2Request {
  body: SaveCartV2Body;
}

export interface SaveCartBody {
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

export interface SaveCartRequest {
  body: SaveCartBody;
}

// SaveCart Response Models (updated based on new API response)
export interface SavedCartItem {
  id: number;
  itemDosageId: number;
  drugName: string;
  quantity: number;
  unitPrice: number;
  hst: number;
  total: number;
  questionnaireAnswers: QuestionnaireAnswer[];
}

export interface SaveCartResponse {
  id: string; // cart ID
  userId: string;
  isPatientSameAsUser: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: string;
  phone: string;
  weight: string;
  height: string | null;
  birthDate: string;
  healthCardNumber: string;
  allergies: string;
  medications: string;
  surgeries: string;
  otherMedicalConditions: string;
  dateTime: string;
  promoCode: string;
  hst: number;
  discount: number;
  dispensingFee: number
  grandTotal: number;
  items: SavedCartItem[];
  drugs: string; // Summary string like "1 x Tadalafil (10mg)\r\n"
}

export interface PayAndSaveCartAsOrderBody {
  id: string; // cartId from SaveCart response
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

export interface PayAndSaveCartAsOrderRequest {
  body: PayAndSaveCartAsOrderBody;
}

export interface SetOrderShippingAddressBody {
  orderID: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  specialInstructions: string;
}

export interface SetOrderShippingAddressRequest {
  body: SetOrderShippingAddressBody;
}

// Add Item to Cart (for related items)
export interface AddItemToCartBody {
  cartId: string;
  itemDosageId: number;
  quantity: number;
  answers: QuestionnaireAnswer[];
}

export interface AddItemToCartRequest {
  body: AddItemToCartBody;
}

// Remove Item from Cart (for related items)
export interface RemoveItemFromCartBody {
  cartId: string;
  orderDetailId: number;
  itemDosageId: number;
  quantity: number;
  answers: QuestionnaireAnswer[];
}

export interface RemoveItemFromCartRequest {
  body: RemoveItemFromCartBody;
}

export interface GetShoppingCart {
  body: string; // CartId
}

// Load Cart (for abandoned checkout resume)
export interface LoadCartRequest {
  body: string; // cartId
}
