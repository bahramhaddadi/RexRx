import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { AppUpdateService } from './services/app-update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Button],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly appUpdateService = inject(AppUpdateService);
  title = 'pharma';

  ngOnInit(): void {
    // Initialize service worker update checker
    this.appUpdateService.init();
  }
}
