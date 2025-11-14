import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { Question, QuestionChoice } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { forkJoin } from 'rxjs';

// Question Type Enum
enum QuestionType {
  SingleChoice = 1,           // Radio buttons - must select one
  MultipleChoice = 2,         // Checkboxes - must select at least one
  MultipleChoiceWithNone = 3, // Checkboxes - "None of these apply" option
  FormFill = 4,              // Text input fields
  Terminate = 5,             // User cannot get this drug
  LastQuestion = 10          // Last question marker
}

interface QuestionWithChoices extends Question {
  choices: QuestionChoice[];
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
  questions: QuestionWithChoices[] = [];
  currentQuestionIndex: number = 0;
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

      if (this.drugEid) {
        this.loadQuestions();
      } else {
        this.errorMessage = 'Drug ID is missing';
      }
    });
  }

  /**
   * Loads questions for the selected drug
   */
  loadQuestions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.getQuestions(this.drugEid).subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body.length > 0) {
          // Load choices for all questions
          const choiceRequests = response.body.map(question =>
            this.drugService.getChoices(question.id)
          );

          forkJoin(choiceRequests).subscribe({
            next: (choicesResponses) => {
              this.questions = response.body.map((question, index) => ({
                ...question,
                choices: choicesResponses[index].errorCode === 0
                  ? choicesResponses[index].body.filter(choice => choice.questionID === question.id)
                  : [],
                selectedChoiceIds: [],
                textAnswers: {},
                noneSelected: false
              }));
              this.isLoading = false;
            },
            error: (error) => {
              this.errorMessage = 'Failed to load question choices. Please try again later.';
              console.error('Error loading choices:', error);
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
          this.router.navigate(['/checkout']);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load questions. Please try again later.';
        console.error('Error loading questions:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Gets the current question being displayed
   */
  get currentQuestion(): QuestionWithChoices | null {
    return this.questions[this.currentQuestionIndex] || null;
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
        const hasAnswers = question.choices.some(choice => {
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
   * Navigates to the next question
   */
  onNextQuestion(): void {
    const currentQ = this.currentQuestion;

    // Check if current question is a Terminate type
    if (currentQ && currentQ.questionTypeID === QuestionType.Terminate) {
      this.handleTermination();
      return;
    }

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
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
   * Navigates to the previous question
   */
  onPreviousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
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
   * Submits all answers
   */
  onSubmit(): void {
    console.log('Submitting answers:', this.questions);
    // TODO: Send answers to API and navigate to next step
    alert('Questionnaire completed! Answers logged to console.');
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
   * Checks if we're on the last question
   */
  isLastQuestion(): boolean {
    const currentQ = this.currentQuestion;
    return this.currentQuestionIndex === this.questions.length - 1 ||
           (currentQ?.questionTypeID === QuestionType.LastQuestion);
  }

  /**
   * Gets the submit button label based on question type
   */
  getSubmitButtonLabel(): string {
    const currentQ = this.currentQuestion;

    if (!currentQ) return 'Next';

    if (this.isLastQuestion()) {
      return 'Submit';
    }

    if (currentQ.questionTypeID === QuestionType.MultipleChoiceWithNone && currentQ.noneSelected) {
      return 'None of these apply';
    }

    return 'Next';
  }

  /**
   * Navigates back to home or drugs list
   */
  goBackHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Checks if we're on the first question
   */
  isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }
}
