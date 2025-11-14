import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DrugCardComponent } from '../../components/drug-card/drug-card.component';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { Drug } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [
    CommonModule,
    DrugCardComponent,
    ButtonModule,
    ProgressSpinnerModule,
    CardModule,
    PageLayoutComponent
  ],
  templateUrl: './drug-list.component.html',
  styleUrls: ['./drug-list.component.scss']
})
export class DrugListComponent implements OnInit {
  private readonly drugService = inject(DrugService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  filteredDrugs: Drug[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  categoryId?: number;
  categoryName: string = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['categoryId'] ? +params['categoryId'] : undefined;
      this.categoryName = params['categoryName'] || 'All Drugs';
      this.loadDrugs();
    });
  }

  /**
   * Loads drugs from the API using category filter
   */
  loadDrugs(): void {
    if (!this.categoryId) {
      this.errorMessage = 'Category ID is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.getDrugsByCategory(this.categoryId).subscribe({
      next: (response) => {
        if (response.errorCode === 0) {
          this.filteredDrugs = response.body;
        } else {
          this.errorMessage = response.errorMessage || 'Failed to load drugs';
          console.error('API Error:', response.errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load drugs. Please try again later.';
        console.error('Error loading drugs:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigates back to home page
   */
  onBackClick(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Handles drug card click - navigates to dose selection page
   */
  onDrugClick(drug: Drug): void {
    this.router.navigate(['/drug-doses'], {
      queryParams: {
        eid: drug.eid,
        name: drug.title
      }
    });
  }

  /**
   * Handles "Help me choose" button click
   * Fetches placeholder item and navigates to questionnaire
   */
  onHelpMeChoose(): void {
    if (!this.categoryId) {
      console.error('Category ID is required');
      return;
    }

    this.isLoading = true;
    this.drugService.getPlaceHolderItem(this.categoryId).subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          // Navigate to drug questions with eid, doseID, and placeholder flag
          this.router.navigate(['/drug-questions'], {
            queryParams: {
              eid: response.body.eid,
              doseId: response.body.doseID,
              name: this.categoryName,
              isPlaceholder: 'true'
            }
          });
        } else {
          this.errorMessage = response.errorMessage || 'Failed to get placeholder item';
          console.error('API Error:', response.errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to process request. Please try again later.';
        console.error('Error getting placeholder item:', error);
        this.isLoading = false;
      }
    });
  }
}
