import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-truvada',
  standalone: true,
  imports: [
    ButtonModule,
    PageLayoutComponent
  ],
  templateUrl: './truvada.component.html',
  styleUrls: ['./truvada.component.scss']
})
export class TruvadaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form fields
  drugEid: string = '';
  drugName: string = '';
  // State
  isLoading: boolean = false;

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Buy Truvada Online in Canada | HIV Prevention & Treatment');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Order Truvada (emtricitabine + tenofovir) online in Canada. Used for HIV treatment and prevention with safe, discreet delivery.'
      },
      {
        name: 'keywords',
        content: 'Truvada, ED treatment, erectile dysfunction, buy tadalafil online'
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