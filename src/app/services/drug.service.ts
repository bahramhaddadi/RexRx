import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Drug, GetDrugListRequest, DrugDose, GetItemDoseListRequest, Question, GetQuestionsRequest, QuestionChoice, GetChoicesRequest, PlaceholderItem, GetPlaceHolderItemRequest, GetDrugsByCategoryRequest, RelatedDrug, GetRecommendedDrugsRequest, GetFirstQuestionRequest, GetNextQuestionRequest, QuestionWithAnswer, SaveCartV2Request, SaveCartV2Body, GetRelatedItemsRequest } from '../models/drug.model';
import { ApiResponse } from '../models/drug-category.model';

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  private readonly apiService = inject(ApiService);

  /**
   * Fetches the list of drugs from the API
   * @param categoryId Optional category ID to filter drugs
   * @returns Observable of API response containing drugs array
   */
  getDrugList(categoryId?: number): Observable<ApiResponse<Drug[]>> {
    const request: GetDrugListRequest = {
      body: null
    };

    return this.apiService.post<ApiResponse<Drug[]>>(
      '/Pharma/Drug/GetDrugList',
      request
    );
  }

  /**
   * Fetches the list of available doses for a specific drug
   * @param drugEid The drug's eid (unique identifier)
   * @returns Observable of API response containing drug doses array
   */
  getItemDoseList(drugEid: string): Observable<ApiResponse<DrugDose[]>> {
    const request: GetItemDoseListRequest = {
      body: drugEid
    };

    return this.apiService.post<ApiResponse<DrugDose[]>>(
      '/Pharma/Drug/GetItemDoseList',
      request
    );
  }

  /**
   * Fetches the list of questions for a specific drug
   * @param drugEid The drug's eid (unique identifier)
   * @returns Observable of API response containing questions array
   */
  getQuestions(drugEid: string): Observable<ApiResponse<Question[]>> {
    const request: GetQuestionsRequest = {
      body: drugEid
    };

    return this.apiService.post<ApiResponse<Question[]>>(
      '/Pharma/Drug/GetQuestions',
      request
    );
  }

  /**
   * Fetches the list of choices for a specific question
   * @param questionId The question's ID
   * @returns Observable of API response containing question choices array
   */
  getChoices(questionId: number): Observable<ApiResponse<QuestionChoice[]>> {
    const request: GetChoicesRequest = {
      body: questionId
    };

    return this.apiService.post<ApiResponse<QuestionChoice[]>>(
      '/Pharma/Drug/GetQuestionChoices',
      request
    );
  }

  /**
   * Fetches placeholder item for a category (used for "Help me choose" feature)
   * @param categoryId The category ID
   * @returns Observable of API response containing placeholder item
   */
  getPlaceHolderItem(categoryId: number): Observable<ApiResponse<PlaceholderItem>> {
    const request: GetPlaceHolderItemRequest = {
      body: categoryId
    };

    return this.apiService.post<ApiResponse<PlaceholderItem>>(
      '/Pharma/Drug/GetPlaceHolderItem',
      request
    );
  }

  /**
   * Fetches drugs by category with optional search criteria
   * @param categoryId The category ID to filter by
   * @param searchCriteria Optional search criteria to filter drugs
   * @returns Observable of API response containing drugs array
   */
  getDrugsByCategory(categoryId: number, searchCriteria: string = ''): Observable<ApiResponse<Drug[]>> {
    const request: GetDrugsByCategoryRequest = {
      categoryID: categoryId,
      searchCriteria: searchCriteria
    };

    return this.apiService.post<ApiResponse<Drug[]>>(
      '/Pharma/Drug/GetDrugsByCategory',
      request
    );
  }

  /**
   * Fetches recommended drugs based on answered questions
   * @param itemDoseId The item dose ID (from placeholder API)
   * @returns Observable of API response containing recommended drugs
   */
  getRecommendedDrugs(itemDoseId: number): Observable<ApiResponse<RelatedDrug[]>> {
    const request: GetRecommendedDrugsRequest = {
      body: itemDoseId
    };

    return this.apiService.post<ApiResponse<RelatedDrug[]>>(
      '/Pharma/Drug/GetRecommendedDrugsV2',
      request
    );
  }

  /**
   * Fetches related items for upsell based on selected item dose
   * @param itemDoseId The selected ItemDoseID
   */
  getRelatedItems(itemDoseId: number): Observable<ApiResponse<any[]>> {
    const request: GetRelatedItemsRequest = {
      body: itemDoseId
    };

    return this.apiService.post<ApiResponse<any[]>>(
      '/Pharma/Drug/GetRelatedItems',
      request
    );
  }

  /**
   * Fetches the first question for a drug
   * @param itemEid The drug's eid (unique identifier)
   * @returns Observable of API response containing the first question
   */
  getFirstQuestion(itemEid: string): Observable<ApiResponse<Question>> {
    const request: GetFirstQuestionRequest = {
      body: itemEid
    };

    return this.apiService.post<ApiResponse<Question>>(
      '/Pharma/Drug/GetFirstQuestion',
      request
    );
  }

  /**
   * Fetches the next question based on current question and answers
   * @param questionWithAnswers The current question with selected answers
   * @returns Observable of API response containing the next question
   */
  getNextQuestion(questionWithAnswers: QuestionWithAnswer): Observable<ApiResponse<Question>> {
    const request: GetNextQuestionRequest = {
      body: questionWithAnswers
    };

    return this.apiService.post<ApiResponse<Question>>(
      '/Pharma/Drug/GetNextQuestion',
      request
    );
  }

  /**
   * Saves the shopping cart with patient information and questionnaire answers
   * @param cartData The cart data with patient info and questionnaire answers
   * @returns Observable of API response
   */
  SaveCartV2(cartData: SaveCartV2Body): Observable<ApiResponse<any>> {
    const request: SaveCartV2Request = {
      body: cartData
    };

    return this.apiService.post<ApiResponse<any>>(
      '/Pharma/Shopping/SaveCartV2',
      request
    );
  }
}
