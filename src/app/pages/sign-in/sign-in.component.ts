import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { CaptchaService } from '../../services/captcha.service';
import { AuthService } from '../../services/auth.service';
import { CaptchaResponse } from '../../models/auth.model';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    MessageModule,
    PageLayoutComponent
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  private readonly captchaService = inject(CaptchaService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email: string = '';
  password: string = '';
  captchaCode: string = '';
  captchaImageUrl: string = '';
  captchaRefId: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';
  captchaLoading: boolean = false;

  ngOnInit(): void {
    this.loadCaptcha();
  }

  /**
   * Load CAPTCHA image
   */
  loadCaptcha(): void {
    this.captchaLoading = true;
    this.errorMessage = '';

    this.captchaService.getCaptcha().subscribe({
      next: (response: CaptchaResponse) => {
        this.captchaRefId = response.refId;
        this.captchaImageUrl = this.captchaService.getCaptchaImageUrl(response.imageBase64);
        this.captchaLoading = false;
      },
      error: (error) => {
        console.error('Error loading CAPTCHA:', error);
        this.errorMessage = 'Failed to load CAPTCHA. Please try again.';
        this.captchaLoading = false;
      }
    });
  }

  /**
   * Refresh CAPTCHA image
   */
  refreshCaptcha(): void {
    this.captchaCode = '';
    this.loadCaptcha();
  }

  /**
   * Handle sign in
   */
  onSignIn(): void {
    // Clear previous error
    this.errorMessage = '';

    // Validate inputs
    if (!this.email || !this.password || !this.captchaCode) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;

    this.authService.authenticate({
      email: this.email,
      password: this.password,
      refId: this.captchaRefId,
      captchaCode: this.captchaCode
    }).subscribe({
      next: (response) => {
        if (response.exceptionCode === 0) {
          // Success - navigate to home or dashboard
          console.log('Authentication successful:', response);
          this.router.navigate(['/']);
        } else {
          // Authentication failed with error
          this.refreshCaptcha();
          this.errorMessage = response.exceptionMessage || 'Authentication failed';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Authentication error:', error);
        this.errorMessage = error.error?.exceptionMessage || 'Authentication failed. Please try again.';
        this.refreshCaptcha();
        this.isLoading = false;
      }
    });
  }

  onForgotPassword(): void {
    this.router.navigate(['/reset-password']);
  }

  onSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
