import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-finasteride-minoxidil',
  standalone: true,
  imports: [
    ButtonModule,
    PageLayoutComponent
  ],
  templateUrl: './finasteride-minoxidil.component.html',
  styleUrls: ['./finasteride-minoxidil.component.scss']
})
export class FinasterideMinoxidilComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form fields
  drugEid: string = '';
  drugName: string = '';
  // State
  isLoading: boolean = false;

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Buy Finasteride 0.5% & Minoxidil 5% Foam Online | Hair Loss Treatment');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Order Finasteride 0.5% & Minoxidil 5% Foam online in Canada. Clinically proven treatment for hair loss with safe delivery.'
      },
      {
        name: 'keywords',
        content: 'Finasteride, Minoxidil, Hair Loss, buy Finasteride Minoxidil online'
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