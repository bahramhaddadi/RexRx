import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { CartItem, QuestionnaireAnswer, RelatedDrug, SaveCartBody } from '../../models/drug.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-drug-summary',
  standalone: true,
  imports: [CommonModule, PageLayoutComponent, CardModule, ButtonModule, ProgressSpinnerModule, MessageModule],
  templateUrl: './drug-summary.component.html',
  styleUrls: ['./drug-summary.component.scss']
})
export class DrugSummaryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly drugService = inject(DrugService);

  drugName: string = '';
  doseId?: number;
  relatedItems: RelatedDrug[] = [];
  isLoading = false;
  errorMessage = '';
  selectedRelatedIds = new Set<string>();
  questionnaireAnswers: QuestionnaireAnswer[] = [];

  // New properties for display
  selectedDose: string = '';
  selectedQuantity: number = 0;
  selectedPrice: number = 12.00;
  selectedDrug: { imageUrl?: string } | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.doseId = params['doseId'] ? +params['doseId'] : undefined;
      this.drugName = params['name'] || 'Drug';
      this.selectedDose = params['dose'] || 'Standard Dose';
      this.selectedQuantity = params['quantity'] ? +params['quantity'] : 1;
      this.selectedPrice = params['price'] ? +params['price'] : 12.00;

      // Read questionnaire answers passed via navigation state
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras?.state || history.state;
      this.questionnaireAnswers = state?.['questionnaireAnswers'] || [];

      if (this.doseId) {
        this.fetchRelated();
      } else {
        this.errorMessage = 'Missing dose identifier';
      }
    });
  }

  fetchRelated(): void {
    if (!this.doseId) return;
    this.isLoading = true;
    this.drugService.getRelatedItems(this.doseId).subscribe({
      next: (res) => {
        if (res.errorCode === 0) {
          this.relatedItems = res.body || [];
        } else {
          this.errorMessage = res.errorMessage || 'Failed to load related products';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load related products';
        this.isLoading = false;
      }
    });
  }

  toggleRelated(item: RelatedDrug): void {
    if (!item.id) return;
    if (this.selectedRelatedIds.has(item.id)) {
      this.selectedRelatedIds.delete(item.id);
    } else {
      this.selectedRelatedIds.add(item.id);
    }
  }

  isSelected(item: RelatedDrug): boolean {
    return this.selectedRelatedIds.has(item.id);
  }

  getSelectedRelatedItems(): RelatedDrug[] {
    return this.relatedItems.filter(item => this.selectedRelatedIds.has(item.id));
  }

  calculateTax(): string {
    const tax = this.selectedPrice * 0.10;
    return tax.toFixed(2);
  }

  calculateTotal(): string {
    const subtotal = this.selectedPrice;
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    return total.toFixed(2);
  }

  proceedToCheckout(): void {
    if (!this.doseId) {
      this.router.navigate(['/checkout']);
      return;
    }

    const items: CartItem[] = [];
    items.push({
      itemDosageId: this.doseId,
      quantity: 1,
      questionnaireAnswers: this.questionnaireAnswers || []
    });

    this.relatedItems.forEach(item => {
      if (this.selectedRelatedIds.has(item.id)) {
        const dosageId = parseInt(item.id, 10);
        if (!isNaN(dosageId) && dosageId !== this.doseId) {
          items.push({
            itemDosageId: dosageId,
            quantity: 1,
            questionnaireAnswers: []
          });
        }
      }
    });

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
              drugName: this.drugName,
              cartId: cartId,
              cartItems: items
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
