import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { CartItem, QuestionnaireAnswer } from '../../models/drug.model';
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
  relatedItems: any[] = [];
  isLoading = false;
  errorMessage = '';
  // User can select any of the related items to add alongside
  selectedRelatedIds = new Set<number>();
  // Questionnaire answers passed from questions page (needed for main item)
  questionnaireAnswers: QuestionnaireAnswer[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.doseId = params['doseId'] ? +params['doseId'] : undefined;
      this.drugName = params['name'] || 'Drug';
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

  toggleRelated(item: any): void {
    const id = item?.id ?? item?.Id ?? item?.itemDosageId;
    if (id == null) return;
    if (this.selectedRelatedIds.has(id)) this.selectedRelatedIds.delete(id);
    else this.selectedRelatedIds.add(id);
  }

  proceedToCheckout(): void {
    if (!this.doseId) {
      // Fallback: go directly with no items (checkout will show error)
      this.router.navigate(['/checkout']);
      return;
    }

    // Build cart items: main item + selected related items
    const items: CartItem[] = [];
    items.push({
      itemDosageId: this.doseId,
      quantity: 1,
      questionnaireAnswers: this.questionnaireAnswers || []
    });

    // Map related selection to cart items (no questionnaire answers for related)
    Array.from(this.selectedRelatedIds).forEach(id => {
      if (id !== this.doseId) {
        items.push({
          itemDosageId: id,
          quantity: 1,
          questionnaireAnswers: []
        });
      }
    });

    this.router.navigate(['/checkout'], {
      state: {
        drugName: this.drugName,
        cartItems: items
      }
    });
  }
}
