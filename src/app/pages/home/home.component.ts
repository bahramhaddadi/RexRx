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

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
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

  faqItems: FaqItem[] = [
    { question: 'What is an online pharmacy?', answer: 'An online pharmacy allows you to order prescription and non-prescription medications digitally, with safe and discreet delivery to your home.', open: false },
    { question: 'How does online healthcare work?', answer: 'You can consult licensed healthcare providers online through secure forms or virtual visits. Prescriptions, if needed, are sent directly to the pharmacy for fulfillment.', open: false },
    { question: 'Is online healthcare safe and secure?', answer: 'Yes. All medical information is protected using secure, encrypted systems and follows healthcare privacy regulations.', open: false },
    { question: 'Who provides the medical care?', answer: 'Care is provided by licensed physicians, nurse practitioners, and pharmacists who are authorized to practice in your region.', open: false },
    { question: 'Can I use online services instead of visiting a clinic?', answer: 'Online healthcare is suitable for many common conditions and medication management. Some cases may still require in-person care.', open: false },
    { question: 'How are prescriptions handled?', answer: 'Once approved by a healthcare provider, prescriptions are reviewed by a licensed pharmacist and dispensed according to regulatory standards.', open: false },
    { question: 'How long does delivery take?', answer: 'Most orders are processed within 1\u20132 business days. Delivery times vary based on location and shipping method.', open: false },
    { question: 'Is a prescription required for all medications?', answer: 'Some medications require a valid prescription, while others are available over the counter.', open: false },
    { question: 'Can I speak with a pharmacist?', answer: 'Yes. Pharmacists are available to answer questions about medications, dosing, and usage through secure messaging or phone support.', open: false },
    { question: 'Do you accept insurance?', answer: 'Insurance coverage varies. You can check eligibility during checkout or contact support for assistance.', open: false },
    { question: 'Are my medical records shared?', answer: 'Your information is only shared with authorized healthcare professionals involved in your care.', open: false },
    { question: 'What if my order is delayed or incorrect?', answer: 'Customer support is available to quickly resolve delivery issues, replacements, or refunds.', open: false },
    { question: 'Can I refill my prescription online?', answer: 'Yes. Eligible prescriptions can be refilled online, often with reminders to help you stay on track.', open: false },
    { question: 'What conditions can be treated online?', answer: 'Online healthcare commonly supports general wellness, medication renewals, preventive care, and select chronic conditions.', open: false },
    { question: 'How do I get started?', answer: 'Create an account, complete a health questionnaire, and request care or medication through the platform.', open: false },
  ];

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

  toggleFaq(index: number) {
    this.faqItems[index].open = !this.faqItems[index].open;
  }

  scrollToCategories() {
    const categoriesSection = document.querySelector('.categories-section');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
