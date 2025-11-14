import { Component, inject, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, ButtonModule, HeaderComponent],
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  @Input() showHeader: boolean = true;
  @Input() showBackButton: boolean = false;
  @Input() backButtonLabel: string = '';
  @Input() backButtonRoute: string = '';
  @Input() title: string = '';
  @Input() backgroundColor: string = 'var(--surface-50)';

  onBack() {
    if (this.backButtonRoute) {
      this.router.navigate([this.backButtonRoute]);
    } else {
      this.location.back();
    }
  }
}
