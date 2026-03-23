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
  templateUrl: './tadalafil.component.html',
  styleUrls: ['./tadalafil.component.scss']
})
export class TadalafilComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form fields
  drugEid: string = '';
  drugName: string = '';
  // State
  isLoading: boolean = false;

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Buy Tadalafil Online in Canada | Fast Delivery');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Order Tadalafil (Cialis) online in Canada. Safe, affordable, and discreet delivery.'
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
