import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DrugService } from '../../services/drug.service';
import { Question, QuestionChoice } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { forkJoin } from 'rxjs';

interface QuestionWithChoices extends Question {
  choices: QuestionChoice[];
  selectedChoiceId?: number;
  selectedChoiceIds?: number[];
  textAnswer?: string;
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
    InputTextareaModule
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
                selectedChoiceIds: []
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
          this.errorMessage = response.errorMessage || 'No questions available for this drug';
          this.isLoading = false;
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

    // For single choice questions (questionTypeID === 1, typically radio buttons)
    if (question.questionTypeID === 1) {
      return !!question.selectedChoiceId;
    }

    // For multi-choice questions (questionTypeID === 2, typically checkboxes)
    if (question.questionTypeID === 2) {
      return !!question.selectedChoiceIds && question.selectedChoiceIds.length > 0;
    }

    // For text/form field questions (questionTypeID === 3)
    if (question.questionTypeID === 3) {
      return !!question.textAnswer && question.textAnswer.trim().length > 0;
    }

    // Default: assume answered if any selection is made
    return !!question.selectedChoiceId ||
           (!!question.selectedChoiceIds && question.selectedChoiceIds.length > 0) ||
           (!!question.textAnswer && question.textAnswer.trim().length > 0);
  }

  /**
   * Navigates to the next question
   */
  onNextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
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
      } else {
        const index = this.currentQuestion.selectedChoiceIds.indexOf(choiceId);
        if (index > -1) {
          this.currentQuestion.selectedChoiceIds.splice(index, 1);
        }
      }
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
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  /**
   * Checks if we're on the first question
   */
  isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }
}
