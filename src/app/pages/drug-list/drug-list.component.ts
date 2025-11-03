import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DrugCardComponent } from '../../components/drug-card/drug-card.component';
import { DrugService } from '../../services/drug.service';
import { Drug } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [
    CommonModule,
    DrugCardComponent,
    ButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './drug-list.component.html',
  styleUrls: ['./drug-list.component.scss']
})
export class DrugListComponent implements OnInit {
  drugs: Drug[] = [];
  filteredDrugs: Drug[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  categoryId?: number;
  categoryName: string = '';

  constructor(
    private drugService: DrugService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['categoryId'] ? +params['categoryId'] : undefined;
      this.categoryName = params['categoryName'] || 'All Drugs';
      this.loadDrugs();
    });
  }

  /**
   * Loads drugs from the API and filters by category if provided
   */
  loadDrugs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.getDrugList().subscribe({
      next: (response) => {
        if (response.errorCode === 0) {
          this.drugs = response.body;
          this.filterDrugsByCategory();
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
   * Filters drugs by the selected category
   */
  private filterDrugsByCategory(): void {
    if (this.categoryId !== undefined) {
      this.filteredDrugs = this.drugs.filter(drug => drug.categoryID === this.categoryId);
    } else {
      this.filteredDrugs = this.drugs;
    }
  }

  /**
   * Navigates back to home page
   */
  onBackClick(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Handles drug card click
   */
  onDrugClick(drug: Drug): void {
    console.log('Drug clicked:', drug);
    // TODO: Navigate to drug details page
  }
}
