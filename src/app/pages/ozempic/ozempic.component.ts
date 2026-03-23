import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ButtonModule,
    PageLayoutComponent
  ],
  templateUrl: './ozempic.component.html',
  styleUrls: ['./ozempic.component.scss']
})
export class OzempicComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form fields
  drugEid: string = '';
  drugName: string = '';
  // State
  isLoading: boolean = false;

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Buy Ozempic Online in Canada | Weight Loss & Diabetes Treatment');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Order Ozempic (semaglutide) online in Canada. Effective for weight loss and type 2 diabetes with safe, discreet delivery.'
      },
      {
        name: 'keywords',
        content: 'Tadalafil, Cialis, ED treatment, erectile dysfunction, buy tadalafil online'
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
