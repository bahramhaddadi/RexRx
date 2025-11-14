import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { DrugCategoryService } from '../../services/drug-category.service';
import { DrugCategory } from '../../models/drug-category.model';

interface Category {
  id: number;
  title: string;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    ButtonModule,
    PageLayoutComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly drugCategoryService = inject(DrugCategoryService);
  private readonly router = inject(Router);

  categories: Category[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '1200px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '992px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  ngOnInit() {
    this.loadDrugCategories();
  }

  /**
   * Loads drug categories from the API
   */
  private loadDrugCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.drugCategoryService.getDrugCategoryList().subscribe({
      next: (response) => {
        if (response.errorCode === 0) {
          this.categories = this.mapDrugCategoriesToCategories(response.body);
        } else {
          this.errorMessage = response.errorMessage || 'Failed to load categories';
          console.error('API Error:', response.errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories. Please try again later.';
        console.error('Error loading drug categories:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Maps DrugCategory objects from API to Category objects for the UI
   */
  private mapDrugCategoriesToCategories(drugCategories: DrugCategory[]): Category[] {
    return drugCategories.map(drugCategory => ({
      id: drugCategory.id,
      title: drugCategory.title,
      description: drugCategory.note || '',
      image: drugCategory.imageUrl || ''
    }));
  }

  onCategoryClick(category: Category) {
    console.log('Category clicked:', category);
    this.router.navigate(['/drugs'], {
      queryParams: {
        categoryId: category.id,
        categoryName: category.title
      }
    });
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }

  onCartClick() {
    console.log('Cart clicked');
  }
}
