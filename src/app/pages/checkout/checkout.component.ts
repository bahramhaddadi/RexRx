import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { UserService } from '../../services/user.service';
import { CartItem, QuestionnaireAnswer, SaveCartBody, PayAndSaveCartAsOrderBody } from '../../models/drug.model';
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
  private readonly userService = inject(UserService);

  // Data received from drug-questions page
  drugName: string = '';
  doseId?: number;
  questionnaireAnswers: QuestionnaireAnswer[] = [];
  // Optional: if provided by previous step (drug-summary), use these directly
  cartItems: CartItem[] = [];

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
  cartId: string = ''; // Stores the cart ID from SaveCart API

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
    this.cartItems = state?.['cartItems'] || [];

    // If cartItems are provided (from /drug-summary), prefer them.
    // For backward-compatibility, set doseId from the first item if present.
    if (this.cartItems && this.cartItems.length > 0) {
      this.doseId = this.cartItems[0]?.itemDosageId ?? this.doseId;
    }

    console.log('Checkout initialized with:', {
      drugName: this.drugName,
      doseId: this.doseId,
      answersCount: this.questionnaireAnswers.length
    });

    // If neither cartItems nor the legacy doseId+answers are provided, show error
    const hasCartItems = this.cartItems && this.cartItems.length > 0;
    const hasLegacy = !!this.doseId && this.questionnaireAnswers.length > 0;
    if (!hasCartItems && !hasLegacy) {
      this.errorMessage = 'Missing required checkout data. Please complete the questionnaire first.';
    }

    // Fetch user profile and pre-fill form fields
    this.loadUserProfile();

    // Save cart on page load to get cartId
    this.saveCartOnLoad();
  }

  /**
   * Saves cart on page load to get cartId
   */
  saveCartOnLoad(): void {
    // Build cart data with empty patient info
    const cartData: SaveCartBody = {
      isPatientSameAsUser: true,
      firstName: '',
      middleName: '',
      lastName: '',
      sex: '',
      phone: '',
      weight: '',
      birthDate: '',
      healthCardNumber: '',
      allergies: '',
      medications: '',
      surgeries: '',
      otherMedicalConditions: '',
      orderDate: this.formatDate(new Date()),
      promoCode: '',
      items: (this.cartItems && this.cartItems.length > 0)
        ? this.cartItems
        : [
            {
              itemDosageId: this.doseId!,
              quantity: 1,
              questionnaireAnswers: this.questionnaireAnswers
            }
          ]
    };

    console.log('Saving cart on page load:', cartData);

    this.drugService.SaveCart(cartData).subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          this.cartId = response.body;
          console.log('Cart saved successfully, cartId:', this.cartId);
        } else {
          console.error('Failed to save cart:', response.errorMessage);
          this.errorMessage = 'Failed to initialize checkout. Please try again.';
        }
      },
      error: (error) => {
        console.error('Error saving cart:', error);
        this.errorMessage = 'Failed to initialize checkout. Please try again.';
      }
    });
  }

  /**
   * Loads user profile and pre-fills form fields
   */
  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          const profile = response.body;

          // Pre-fill form fields from user profile
          this.firstName = profile.firstName || '';
          this.middleName = profile.middleName || '';
          this.lastName = profile.lastName || '';
          this.sex = profile.gender || '';
          this.phone = profile.phone || '';
          this.allergies = profile.allergies || '';
          this.medications = profile.medications || '';
          this.surgeries = profile.surgeries || '';
          this.otherMedicalConditions = profile.otherConditions || '';

          // Parse and set birth date
          if (profile.dateOfBirth) {
            this.birthDate = new Date(profile.dateOfBirth);
          }

          console.log('User profile loaded and form pre-filled');
        } else {
          console.warn('Failed to load user profile:', response.errorMessage);
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        // Don't show error to user, just log it - form can still be filled manually
      }
    });
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

    // Validate cartId exists
    if (!this.cartId) {
      this.errorMessage = 'Cart not initialized. Please refresh the page and try again.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Format birth date (date only, no time)
    const formattedBirthDate = this.birthDate
      ? this.formatDateOnly(this.birthDate)
      : '';

    // Build order data with cartId
    const orderData: PayAndSaveCartAsOrderBody = {
      id: this.cartId, // Use the cartId from SaveCart
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
      items: (this.cartItems && this.cartItems.length > 0)
        ? this.cartItems
        : [
            {
              itemDosageId: this.doseId!,
              quantity: 1,
              questionnaireAnswers: this.questionnaireAnswers
            }
          ]
    };

    console.log('Submitting order data:', orderData);

    this.drugService.PayAndSaveCartAsOrder(orderData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.errorCode === 0) {
          console.log('Order submitted successfully, redirecting to Stripe checkout:', response.body);
          // Redirect to Stripe checkout URL
          if (response.body) {
            window.location.href = response.body;
          } else {
            this.errorMessage = 'Checkout URL not provided';
            console.error('Missing checkout URL in response');
          }
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
    const baseValid = !!(
      this.firstName &&
      this.lastName &&
      this.sex &&
      this.phone &&
      this.weight &&
      this.birthDate
    );

    // Accept either cartItems provided, or legacy single doseId path
    const hasItems = (this.cartItems && this.cartItems.length > 0) || !!this.doseId;
    return baseValid && hasItems;
  }

  /**
   * Formats a Date object to date-only format (YYYY-MM-DD)
   */
  formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Formats a Date object to the required string format with time
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
