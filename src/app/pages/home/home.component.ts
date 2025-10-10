import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

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
    ButtonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];

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
    this.categories = [
      {
        id: 1,
        title: 'Category 1',
        description: 'Category Description Lorem ipsum dolor sit amet',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop'
      },
      {
        id: 2,
        title: 'Weight Loss',
        description: 'Better Wellness, Through Science',
        image: ''
      },
      {
        id: 3,
        title: 'Category 3',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        image: ''
      },
      {
        id: 4,
        title: 'Category 4',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        image: ''
      },
      {
        id: 5,
        title: 'Category 5',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        image: ''
      }
    ];
  }

  onCategoryClick(category: Category) {
    console.log('Category clicked:', category);
  }

  onLoginClick() {
    console.log('Login clicked');
  }

  onCartClick() {
    console.log('Cart clicked');
  }
}
