import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { UserService } from '../../services/user.service';
import { CartItem, QuestionnaireAnswer, SaveCartBody, PayAndSaveCartAsOrderBody, RelatedDrug } from '../../models/drug.model';
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

  // Related items for upsell
  relatedItems: RelatedDrug[] = [];
  isLoadingRelated: boolean = false;

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
    this.cartId = state?.['cartId'] || ''; // Get cartId from navigation state

    // If cartItems are provided (from /drug-summary), prefer them.
    // For backward-compatibility, set doseId from the first item if present.
    if (this.cartItems && this.cartItems.length > 0) {
      this.doseId = this.cartItems[0]?.itemDosageId ?? this.doseId;
    }

    console.log('Checkout initialized with:', {
      drugName: this.drugName,
      doseId: this.doseId,
      answersCount: this.questionnaireAnswers.length,
      cartId: this.cartId
    });

    // If cartId is not provided, show error
    if (!this.cartId) {
      this.errorMessage = 'Missing cart ID. Please go back and try again.';
    }

    // Fetch user profile and pre-fill form fields
    this.loadUserProfile();

    // Load related items for the main drug
    if (this.doseId) {
      this.loadRelatedItems();
    }
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
   * Loads related items for upsell
   */
  loadRelatedItems(): void {
    if (!this.doseId) return;

    this.isLoadingRelated = true;
    this.drugService.getRelatedItems(this.doseId).subscribe({
      next: (res) => {
        if (res.errorCode === 0) {
          this.relatedItems = (res.body || []).filter(item => {
            // Filter out items already in cart
            return !this.cartItems.some(cartItem => cartItem.itemDosageId === item.doseId);
          });
        } else {
          console.warn('Failed to load related products:', res.errorMessage);
        }
        this.isLoadingRelated = false;
      },
      error: (err) => {
        console.error('Error loading related products:', err);
        this.isLoadingRelated = false;
      }
    });
  }

  /**
   * Adds an item to the cart
   */
  addItemToCart(item: RelatedDrug): void {
    // Check if item is already in cart
    const existingItem = this.cartItems.find(cartItem => cartItem.itemDosageId === item.doseId);

    if (existingItem) {
      this.errorMessage = 'Item is already in your cart';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    // Add item to cart
    this.cartItems.push({
      itemDosageId: item.doseId,
      quantity: 1,
      questionnaireAnswers: []
    });

    // Remove from related items list
    this.relatedItems = this.relatedItems.filter(relatedItem => relatedItem.doseId !== item.doseId);

    console.log('Item added to cart:', item);
    console.log('Updated cart items:', this.cartItems);
  }

  /**
   * Removes an item from the cart
   */
  removeItemFromCart(item: CartItem): void {
    // Prevent removing the main item (first item)
    if (this.cartItems.length > 0 && this.cartItems[0].itemDosageId === item.itemDosageId) {
      this.errorMessage = 'Cannot remove the main item from cart';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    // Remove item from cart
    this.cartItems = this.cartItems.filter(cartItem => cartItem.itemDosageId !== item.itemDosageId);

    // Optionally, reload related items to show the removed item again
    if (this.doseId) {
      this.loadRelatedItems();
    }

    console.log('Item removed from cart:', item);
    console.log('Updated cart items:', this.cartItems);
  }

  /**
   * Gets display name for cart item
   */
  getCartItemName(item: CartItem): string {
    // If it's the main drug, use drugName
    if (this.doseId && item.itemDosageId === this.doseId) {
      return this.drugName || 'Main Medication';
    }
    // For related items, we might need to fetch the name
    return `Related Item (ID: ${item.itemDosageId})`;
  }

  /**
   * Checks if cart item is the main item
   */
  isMainItem(item: CartItem): boolean {
    return this.cartItems.length > 0 && this.cartItems[0].itemDosageId === item.itemDosageId;
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
    this.router.navigate(['/']);
  }
}
