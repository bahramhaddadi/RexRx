import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { RelatedDrug } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

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
  templateUrl: './drug-recommendations.component.html',
  styleUrls: ['./drug-recommendations.component.scss']
})
export class DrugRecommendationsComponent implements OnInit {
  private readonly drugService = inject(DrugService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  doseId?: number;
  recommendedDrugs: RelatedDrug[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
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
    if (!this.doseId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.getRecommendedDrugs(this.doseId).subscribe({
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
    this.router.navigate(['/home']);
  }
}
