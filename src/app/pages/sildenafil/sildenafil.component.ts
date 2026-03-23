import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sildenafil',
  standalone: true,
  imports: [
    ButtonModule,
    PageLayoutComponent
  ],
  templateUrl: './sildenafil.component.html',
  styleUrls: ['./sildenafil.component.scss']
})
export class SildenafilComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form fields
  drugEid: string = '';
  drugName: string = '';
  // State
  isLoading: boolean = false;

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Sildenafil (Viagra) | Uses, Dosage, Side Effects');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Learn about Sildenafil (Viagra): uses, dosage, side effects, and safety information.'
      },
      {
        name: 'keywords',
        content: 'Sildenafil, Viagra, ED treatment, erectile dysfunction, buy sildenafil online'
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
