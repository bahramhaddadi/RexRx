import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { Question, QuestionChoice, QuestionWithAnswer, QuestionChoiceAnswer, QuestionType } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';

interface ExtendedQuestion extends Question {
  selectedChoiceId?: number;
  selectedChoiceIds?: number[];
  textAnswers?: { [key: number]: string }; // For FormFill - choice id to answer mapping
  noneSelected?: boolean; // For MultipleChoiceWithNone
}

@Component({
  selector: 'app-drug-questions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    CheckboxModule,
    InputTextModule,
    InputTextareaModule,
    MessageModule,
    PageLayoutComponent
  ],
  templateUrl: './drug-questions.component.html',
  styleUrls: ['./drug-questions.component.scss']
})
export class DrugQuestionsComponent implements OnInit {
  private readonly drugService = inject(DrugService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  drugEid: string = '';
  drugName: string = '';
  doseId?: number; // ItemDoseID from placeholder API
  isPlaceholder: boolean = false; // Flag to indicate if this item is from placeholder
  currentQuestion: ExtendedQuestion | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  isTerminated: boolean = false;
  terminationMessage: string = '';

  // Expose QuestionType enum to template
  readonly QuestionType = QuestionType;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.drugEid = params['eid'] || '';
      this.drugName = params['name'] || 'Drug';
      this.doseId = params['doseId'] ? +params['doseId'] : undefined;
      this.isPlaceholder = params['isPlaceholder'] === 'true';

      if (this.drugEid) {
        this.loadFirstQuestion();
      } else {
        this.errorMessage = 'Drug ID is missing';
      }
    });
  }

  /**
   * Loads the first question for the selected drug
   */
  loadFirstQuestion(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.getFirstQuestion(this.drugEid).subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          this.currentQuestion = {
            ...response.body,
            selectedChoiceIds: [],
            textAnswers: {},
            noneSelected: false
          };
        } else {
          this.errorMessage = response.errorMessage || 'Failed to load question';
          console.error('API Error:', response.errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load question. Please try again later.';
        console.error('Error loading first question:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Checks if the current question has a valid answer
   */
  isCurrentQuestionAnswered(): boolean {
    const question = this.currentQuestion;
    if (!question) return false;

    switch (question.questionTypeID) {
      case QuestionType.SingleChoice:
        // Must select one option
        return !!question.selectedChoiceId;

      case QuestionType.MultipleChoice:
        // Must select at least one option
        return !!question.selectedChoiceIds && question.selectedChoiceIds.length > 0;

      case QuestionType.MultipleChoiceWithNone:
        // Can select none (noneSelected) or select choices
        return question.noneSelected || (!!question.selectedChoiceIds && question.selectedChoiceIds.length > 0);

      case QuestionType.FormFill:
        // Check if all choices with input fields have been filled
        if (!question.textAnswers) return false;
        const hasAnswers = question.questionChoices.some(choice => {
          const answer = question.textAnswers![choice.id];
          return answer && answer.trim().length > 0;
        });
        return hasAnswers;

      case QuestionType.Terminate:
        // Terminate questions always proceed
        return true;

      default:
        return false;
    }
  }

  /**
   * Builds the question with answers object for API submission
   */
  buildQuestionWithAnswers(): QuestionWithAnswer {
    const question = this.currentQuestion!;

    // Build selected choices array
    let selectedChoices: QuestionChoiceAnswer[] = [];

    if (question.questionTypeID === QuestionType.SingleChoice && question.selectedChoiceId) {
      // Single choice - find the selected choice
      const choice = question.questionChoices.find(c => c.id === question.selectedChoiceId);
      if (choice) {
        selectedChoices = [{
          Id: choice.id,
          HasExtraInfo: choice.hasExtraInfo,
          ExtraInfoTitle: choice.extraInfoTitle,
          ImageURL: choice.imageURL,
          RelatedQuestion: choice.relatedQuestion,
          RelatedNextQuestion: choice.relatedNextQuestion
        }];
      }
    } else if ((question.questionTypeID === QuestionType.MultipleChoice ||
                question.questionTypeID === QuestionType.MultipleChoiceWithNone) &&
               question.selectedChoiceIds && question.selectedChoiceIds.length > 0) {
      // Multiple choice - find all selected choices
      selectedChoices = question.questionChoices
        .filter(c => question.selectedChoiceIds!.includes(c.id))
        .map(c => ({
          Id: c.id,
          HasExtraInfo: c.hasExtraInfo,
          ExtraInfoTitle: c.extraInfoTitle,
          ImageURL: c.imageURL,
          RelatedQuestion: c.relatedQuestion,
          RelatedNextQuestion: c.relatedNextQuestion
        }));
    } else if (question.questionTypeID === QuestionType.FormFill) {
      // Form fill - include all choices (text answers will be in ExtraInfoTitle)
      selectedChoices = question.questionChoices.map(c => ({
        Id: c.id,
        HasExtraInfo: c.hasExtraInfo,
        ExtraInfoTitle: question.textAnswers?.[c.id] || c.extraInfoTitle,
        ImageURL: c.imageURL,
        RelatedQuestion: c.relatedQuestion,
        RelatedNextQuestion: c.relatedNextQuestion
      }));
    }

    return {
      Id: question.id,
      QuestionnairID: question.questionnairID,
      NextQuestionID: question.nextQuestionID,
      QuestionTypeID: question.questionTypeID,
      Title: question.title,
      Note: question.note,
      QuestionChoices: selectedChoices
    };
  }

  /**
   * Submits current answer and loads next question
   */
  onNextQuestion(): void {
    const currentQ = this.currentQuestion;

    // Check if current question is a Terminate type
    if (currentQ && currentQ.questionTypeID === QuestionType.Terminate) {
      this.handleTermination();
      return;
    }

    if (!currentQ) return;

    // Check if this is the last question (nextQuestionID is null)
    if (currentQ.nextQuestionID === null) {
      // Last question - navigate to recommendations
      this.handleQuestionsComplete();
      return;
    }

    // Build question with answers
    const questionWithAnswers = this.buildQuestionWithAnswers();

    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.getNextQuestion(questionWithAnswers).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.errorCode === 0 && response.body) {
          // Load next question
          this.currentQuestion = {
            ...response.body,
            selectedChoiceIds: [],
            textAnswers: {},
            noneSelected: false
          };
        } else if (response.errorCode === 0 && !response.body) {
          // No more questions - navigate to recommendations or checkout
          this.handleQuestionsComplete();
        } else {
          this.errorMessage = response.errorMessage || 'Failed to load next question';
          console.error('API Error:', response.errorMessage);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load next question. Please try again later.';
        console.error('Error loading next question:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles completion of all questions
   */
  handleQuestionsComplete(): void {
    console.log('All questions completed');
    console.log('Is Placeholder:', this.isPlaceholder);
    console.log('Dose ID:', this.doseId);

    // If this is from placeholder flow, navigate to recommendations page
    if (this.isPlaceholder && this.doseId) {
      this.router.navigate(['/drug-recommendations'], {
        queryParams: {
          doseId: this.doseId
        }
      });
    } else {
      // TODO: Handle non-placeholder flow (regular drug selection)
      this.router.navigate(['/checkout']);
    }
  }

  /**
   * Handles termination flow when user fails a Terminate question
   */
  handleTermination(): void {
    this.isTerminated = true;
    this.terminationMessage = 'Unfortunately, based on your answers, this medication may not be suitable for you. Please consult with a healthcare professional for alternative options.';
  }

  /**
   * Handles the selection of a single choice (radio button)
   */
  onSingleChoiceSelect(choiceId: number): void {
    if (this.currentQuestion) {
      this.currentQuestion.selectedChoiceId = choiceId;
    }
  }

  /**
   * Handles the selection of multiple choices (checkboxes)
   */
  onMultiChoiceToggle(choiceId: number, event: any): void {
    if (this.currentQuestion) {
      if (!this.currentQuestion.selectedChoiceIds) {
        this.currentQuestion.selectedChoiceIds = [];
      }

      if (event.checked) {
        this.currentQuestion.selectedChoiceIds.push(choiceId);
        // If selecting a choice, clear "none selected" flag
        this.currentQuestion.noneSelected = false;
      } else {
        const index = this.currentQuestion.selectedChoiceIds.indexOf(choiceId);
        if (index > -1) {
          this.currentQuestion.selectedChoiceIds.splice(index, 1);
        }
      }
    }
  }

  /**
   * Handles "None of these apply" option for MultipleChoiceWithNone
   */
  onNoneOfTheseApply(): void {
    if (this.currentQuestion) {
      this.currentQuestion.noneSelected = true;
      this.currentQuestion.selectedChoiceIds = [];
    }
  }

  /**
   * Checks if a choice is selected in multi-choice question
   */
  isChoiceSelected(choiceId: number): boolean {
    return this.currentQuestion?.selectedChoiceIds?.includes(choiceId) || false;
  }

  /**
   * Navigates back to dose selection
   */
  onBackClick(): void {
    this.router.navigate(['/drug-doses'], {
      queryParams: {
        eid: this.drugEid,
        name: this.drugName
      }
    });
  }

  /**
   * Gets the submit button label
   */
  getSubmitButtonLabel(): string {
    const currentQ = this.currentQuestion;

    if (!currentQ) return 'Next';

    // If this is the last question, show Submit
    if (currentQ.nextQuestionID === null) {
      return 'Submit';
    }

    if (currentQ.questionTypeID === QuestionType.MultipleChoiceWithNone && currentQ.noneSelected) {
      return 'None of these apply';
    }

    return 'Next';
  }

  /**
   * Checks if current question is the last question
   */
  isLastQuestion(): boolean {
    return this.currentQuestion?.nextQuestionID === null;
  }

  /**
   * Navigates back to home or drugs list
   */
  goBackHome(): void {
    this.router.navigate(['/home']);
  }
}
