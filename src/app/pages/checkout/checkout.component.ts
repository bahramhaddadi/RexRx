import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { QuestionnaireAnswer, SaveCartV2Body } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageLayoutComponent,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly drugService = inject(DrugService);

  // Data received from drug-questions page
  drugName: string = '';
  doseId?: number;
  questionnaireAnswers: QuestionnaireAnswer[] = [];

  // Form fields
  isPatientSameAsUser: boolean = true;
  firstName: string = '';
  middleName: string = '';
  lastName: string = '';
  sex: string = '';
  phone: string = '';
  weight: string = '';
  birthDate: Date | null = null;
  healthCardNumber: string = '';
  allergies: string = '';
  medications: string = '';
  surgeries: string = '';
  otherMedicalConditions: string = '';
  promoCode: string = '';

  // UI state
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Dropdown options
  sexOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ];

  ngOnInit() {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    this.drugName = state?.['drugName'] || '';
    this.doseId = state?.['doseId'];
    this.questionnaireAnswers = state?.['questionnaireAnswers'] || [];

    console.log('Checkout initialized with:', {
      drugName: this.drugName,
      doseId: this.doseId,
      answersCount: this.questionnaireAnswers.length
    });

    // If no data available, show error
    if (!this.doseId || this.questionnaireAnswers.length === 0) {
      this.errorMessage = 'Missing required checkout data. Please complete the questionnaire first.';
    }
  }

  /**
   * Submits the checkout form
   */
  onSubmit(): void {
    // Validate required fields
    if (!this.validateForm()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Format birth date
    const formattedBirthDate = this.birthDate
      ? this.formatDate(this.birthDate)
      : '';

    // Build cart data
    const cartData: SaveCartV2Body = {
      isPatientSameAsUser: this.isPatientSameAsUser,
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      sex: this.sex,
      phone: this.phone,
      weight: this.weight,
      birthDate: formattedBirthDate,
      healthCardNumber: this.healthCardNumber,
      allergies: this.allergies,
      medications: this.medications,
      surgeries: this.surgeries,
      otherMedicalConditions: this.otherMedicalConditions,
      orderDate: this.formatDate(new Date()),
      promoCode: this.promoCode,
      items: [
        {
          itemDosageId: this.doseId!,
          quantity: 1,
          questionnaireAnswers: this.questionnaireAnswers
        }
      ]
    };

    console.log('Submitting cart data:', cartData);

    this.drugService.SaveCartV2(cartData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.errorCode === 0) {
          this.successMessage = 'Order submitted successfully!';
          console.log('Order response:', response);
          // Optionally navigate to success page or home after a delay
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        } else {
          this.errorMessage = response.errorMessage || 'Failed to submit order';
          console.error('API Error:', response.errorMessage);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to submit order. Please try again later.';
        console.error('Error submitting order:', error);
      }
    });
  }

  /**
   * Validates the form fields
   */
  validateForm(): boolean {
    return !!(
      this.firstName &&
      this.lastName &&
      this.sex &&
      this.phone &&
      this.weight &&
      this.birthDate &&
      this.doseId
    );
  }

  /**
   * Formats a Date object to the required string format
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  /**
   * Navigates back to home
   */
  onCancel(): void {
    this.router.navigate(['/home']);
  }
}
