import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugService } from '../../services/drug.service';
import { DrugDose } from '../../models/drug.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-drug-dose-selection',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    PageLayoutComponent
  ],
  templateUrl: './drug-dose-selection.component.html',
  styleUrls: ['./drug-dose-selection.component.scss']
})
export class DrugDoseSelectionComponent implements OnInit {
  private readonly drugService = inject(DrugService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  drugEid: string = '';
  drugName: string = '';
  doses: DrugDose[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.drugEid = params['eid'] || '';
      this.drugName = params['name'] || 'Drug';

      if (this.drugEid) {
        this.loadDoses();
      } else {
        this.errorMessage = 'Drug ID is missing';
      }
    });
  }

  /**
   * Loads available doses for the selected drug
   */
  loadDoses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.drugService.getItemDoseList(this.drugEid).subscribe({
      next: (response) => {
        if (response.errorCode === 0) {
          this.doses = response.body;
        } else {
          this.errorMessage = response.errorMessage || 'Failed to load doses';
          console.error('API Error:', response.errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load doses. Please try again later.';
        console.error('Error loading doses:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles dose selection
   */
  onDoseSelect(dose: DrugDose): void {
    console.log('Selected dose:', dose);
    // Navigate to questions page
    this.router.navigate(['/drug-questions'], {
      queryParams: {
        eid: this.drugEid,
        name: this.drugName,
        doseId: dose.id
      }
    });
  }

  /**
   * Navigates back to drug list
   */
  onBackClick(): void {
    this.router.navigate(['/drugs']);
  }
}
