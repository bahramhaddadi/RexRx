import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-wegovy',
  standalone: true,
  imports: [
    ButtonModule,
    PageLayoutComponent
  ],
  templateUrl: './wegovy.component.html',
  styleUrls: ['./wegovy.component.scss']
})
export class WegovyComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form fields
  drugEid: string = '';
  drugName: string = '';
  // State
  isLoading: boolean = false;

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Buy Wegovy Online in Canada | Weight Loss Treatment');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Order Wegovy (semaglutide) online in Canada. Effective weight loss treatment with safe and discreet delivery.'
      },
      {
        name: 'keywords',
        content: 'Wegovy, Weight Loss, Diabetes Treatment, buy Wegovy online'
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
