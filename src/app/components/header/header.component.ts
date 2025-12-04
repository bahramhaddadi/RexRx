import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Check if user is authenticated
  isAuthenticated = this.authService.isAuthenticated;
  username = computed(() => this.authService.session()?.username || '');

  menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings'])
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout()
    }
  ];

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignUp() {
    this.router.navigate(['/sign-up']);
  }
}
