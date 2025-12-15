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
  selectedDrugs: RelatedDrug[] = [];
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
   * Toggle drug selection
   */
  selectDrug(drug: RelatedDrug): void {
    const index = this.selectedDrugs.findIndex(d => d.doseId === drug.doseId);

    if (index > -1) {
      // Remove if already selected
      this.selectedDrugs.splice(index, 1);
    } else {
      // Add to selection
      this.selectedDrugs.push({ ...drug, selected: true });
    }
  }

  /**
   * Check if drug is already selected
   */
  isSelected(drug: RelatedDrug): boolean {
    return this.selectedDrugs.some(d => d.doseId === drug.doseId);
  }

  /**
   * Continue to checkout after placeholder flow
   */
  continueToCheckout(): void {
    if (this.selectedDrugs.length === 0) {
      this.errorMessage = 'Please select at least one drug to continue';
      return;
    }

    // Convert selected drugs to cart items
    const items: CartItem[] = this.selectedDrugs.map(drug => ({
      itemDosageId: this.selectedDrugs[0].doseId,
      quantity: 1,
      questionnaireAnswers: this.questionnaireAnswers || []
    }));

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
