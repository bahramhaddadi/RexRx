import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-resume-shopping-cart',
  standalone: true,
  imports: [
    CommonModule,
    PageLayoutComponent,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './resume-shopping-cart.component.html',
  styleUrls: ['./resume-shopping-cart.component.scss']
})
export class ResumeShoppingCartComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly drugService = inject(DrugService);

  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const cartId = params['id'];

      if (!cartId) {
        this.isLoading = false;
        this.errorMessage = 'Invalid link. No cart ID provided.';
        return;
      }

      this.loadShoppingCart(cartId);
    });
  }

  loadShoppingCart(cartId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.LoadCart(cartId).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.errorCode === 0 && response.body) {
          const savedCartResponse = response.body;

          // Navigate to checkout with loaded cart data
          this.router.navigate(['/checkout'], {
            state: {
              drugName: savedCartResponse.items.length > 0
                ? savedCartResponse.items[0].drugName
                : '',
              doseId: savedCartResponse.items.length > 0
                ? savedCartResponse.items[0].itemDosageId
                : undefined,
              questionnaireAnswers: savedCartResponse.items.length > 0
                ? savedCartResponse.items[0].questionnaireAnswers
                : [],
              cartItems: savedCartResponse.items.map(item => ({
                itemDosageId: item.itemDosageId,
                quantity: item.quantity,
                questionnaireAnswers: item.questionnaireAnswers
              })),
              cartId: savedCartResponse.id,
              savedCartResponse: savedCartResponse
            }
          });
        } else {
          this.errorMessage = response.errorMessage || 'Failed to load your cart. It may have expired.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load your cart. Please try again or contact support.';
        console.error('Error loading cart:', error);
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
