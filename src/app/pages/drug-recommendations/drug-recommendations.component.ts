import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { RelatedDrug, QuestionnaireAnswer, SaveCartBody, CartItem } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { register } from 'swiper/element/bundle';

// Register Swiper custom elements
register();

@Component({
  selector: 'app-drug-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    MessageModule,
    PageLayoutComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './drug-recommendations.component.html',
  styleUrls: ['./drug-recommendations.component.scss']
})
export class DrugRecommendationsComponent implements OnInit {
  private readonly drugService = inject(DrugService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  doseId?: number;
  recommendedDrugs: RelatedDrug[] = [];
  selectedDrug?: RelatedDrug; // Changed to single selection
  questionnaireAnswers: QuestionnaireAnswer[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    // Extract questionnaire answers from navigation state
    // getCurrentNavigation() is null in ngOnInit, so we use history.state
    const state = history.state;
    this.questionnaireAnswers = state?.['questionnaireAnswers'] || [];

    console.log('Navigation state:', state);
    console.log('Questionnaire answers received:', this.questionnaireAnswers);

    this.route.queryParams.subscribe(params => {
      this.doseId = params['doseId'] ? +params['doseId'] : undefined;

      if (this.doseId) {
        this.loadRecommendedDrugs();
      } else {
        this.errorMessage = 'Dose ID is missing';
      }
    });
  }

  /**
   * Loads recommended drugs from the API
   */
  loadRecommendedDrugs(): void {
    if (!this.questionnaireAnswers || this.questionnaireAnswers.length === 0) {
      this.errorMessage = 'No questionnaire answers available';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.getRecommendedDrugs(this.questionnaireAnswers).subscribe({
      next: (response) => {
        if (response.errorCode === 0) {
          this.recommendedDrugs = response.body;
          console.log('Recommended drugs:', this.recommendedDrugs);
        } else {
          this.errorMessage = response.errorMessage || 'Failed to load recommended drugs';
          console.error('API Error:', response.errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load recommended drugs. Please try again later.';
        console.error('Error loading recommended drugs:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigates back to home page
   */
  goBackHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Select drug (single selection) and update query params with doseId
   */
  selectDrug(drug: RelatedDrug): void {
    if (!drug.isActive) {
      return;
    }

    // If clicking the same drug, deselect it
    if (this.selectedDrug?.doseId === drug.doseId) {
      this.selectedDrug = undefined;
    } else {
      // Select the new drug and update query params with its doseId
      this.selectedDrug = { ...drug, selected: true };

      // Update query params to replace doseId
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { doseId: drug.doseId },
        queryParamsHandling: 'merge'
      });
    }
  }

  /**
   * Check if drug is already selected (using doseId)
   */
  isSelected(drug: RelatedDrug): boolean {
    return this.selectedDrug?.doseId === drug.doseId;
  }

  /**
   * Continue to checkout after placeholder flow
   */
  continueToCheckout(): void {
    if (!this.selectedDrug) {
      this.errorMessage = 'Please select a drug to continue';
      return;
    }

    // Convert selected drug to cart item using doseId
    const items: CartItem[] = [{
      itemDosageId: this.selectedDrug.doseId,
      quantity: 1,
      questionnaireAnswers: this.questionnaireAnswers || []
    }];

    // Save cart before navigating to checkout
    this.isLoading = true;
    this.errorMessage = '';

    const cartData: SaveCartBody = {
      isPatientSameAsUser: true,
      firstName: '',
      middleName: '',
      lastName: '',
      sex: '',
      phone: '',
      weight: '',
      birthDate: '1900-01-01',
      healthCardNumber: '',
      allergies: '',
      medications: '',
      surgeries: '',
      otherMedicalConditions: '',
      orderDate: this.formatDate(new Date()),
      promoCode: '',
      items: items
    };

    this.drugService.SaveCart(cartData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.errorCode === 0 && response.body) {
          const cartId = response.body;
          console.log('Cart saved successfully before checkout, cartId:', cartId);

          // Navigate to checkout with cartId
          this.router.navigate(['/checkout'], {
            state: {
              cartId: cartId,
              cartItems: items,
              questionnaireAnswers: this.questionnaireAnswers
            }
          });
        } else {
          this.errorMessage = response.errorMessage || 'Failed to save cart';
          console.error('API Error:', response.errorMessage);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to save cart. Please try again.';
        console.error('Error saving cart:', error);
      }
    });
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
}
