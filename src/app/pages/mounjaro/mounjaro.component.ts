import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-mounjaro',
  standalone: true,
  imports: [
    ButtonModule,
    PageLayoutComponent
  ],
  templateUrl: './mounjaro.component.html',
  styleUrls: ['./mounjaro.component.scss']
})
export class MounjaroComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form fields
  drugEid: string = '';
  drugName: string = '';
  // State
  isLoading: boolean = false;

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Buy Mounjaro Online in Canada | Weight Loss & Diabetes Treatment');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Order Mounjaro (tirzepatide) online in Canada. Advanced treatment for type 2 diabetes and weight loss with safe delivery.'
      },
      {
        name: 'keywords',
        content: 'Mounjaro, Weight Loss, Diabetes Treatment, buy Mounjaro online'
      }
    ]);

    this.route.queryParams.subscribe(params => {
      this.drugEid = params['eid'] || '';
      this.drugName = params['name'] || 'Drug';
    });
  }

  onStartConsultation() {
    this.router.navigate(['/drug-doses'], {
      queryParams: {
        eid: this.drugEid,
        name: this.drugName
      }
    });
  }

  onLogIn() {
    this.router.navigate(['/login']);
  }
}