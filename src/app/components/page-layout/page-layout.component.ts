import { Component, inject, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent {
  private readonly location = inject(Location);

  @Input() showBackButton: boolean = true;
  @Input() title: string = '';
  @Input() backgroundColor: string = 'var(--surface-50)';

  onBack() {
    this.location.back();
  }
}
