import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Button } from 'primeng/button';
import { AppUpdateService } from './services/app-update.service';

declare global {
  interface Window {
    gtag?: Function;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Button],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  private readonly appUpdateService = inject(AppUpdateService);
  private readonly router = inject(Router);
  
  title = 'pharma';

  ngOnInit(): void {
    // Initialize service worker update checker
    this.appUpdateService.init();

    this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            page_path: event.urlAfterRedirects
          });
        }
    });
  }
}