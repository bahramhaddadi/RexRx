import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { AuthService } from '../../services/auth.service';
import { CaptchaService } from '../../services/captcha.service';
import { SignUpRequest } from '../../models/auth.model';

interface HearAboutUs {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    DropdownModule,
    CalendarModule,
    MessageModule,
    PageLayoutComponent
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly captchaService = inject(CaptchaService);

  // Form fields
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  confirmEmail: string = '';
  phone: string = '';
  dob: Date | null = null;
  password: string = '';
  confirmPassword: string = '';
  selectedSource: HearAboutUs | null = null;

  // CAPTCHA fields
  captchaCode: string = '';
  captchaRefId: string = '';
  captchaImageUrl: string = '';
  captchaLoading: boolean = false;

  // State
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  readonly hearAboutUsOptions: HearAboutUs[] = [
    { label: 'Facebook', value: 'Facebook' },
    { label: 'Instagram', value: 'Instagram' },
    { label: 'X (Twitter)', value: 'Twitter' },
    { label: 'LinkedIn', value: 'LinkedIn' },
    { label: 'Word of Mouth/Referral', value: 'Referral' },
    { label: 'Email', value: 'Email' },
    { label: 'Digital/Print Ads', value: 'Ads' },
    { label: 'Customer/Preview Sites', value: 'CustomerSites' },
    { label: 'Other', value: 'Other' }
  ];

  ngOnInit() {
    this.loadCaptcha();
  }

  loadCaptcha() {
    this.captchaLoading = true;
    this.captchaService.getCaptcha().subscribe({
      next: (response) => {
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

  refreshCaptcha() {
    this.captchaCode = '';
    this.loadCaptcha();
  }

  validateForm(): boolean {
    // Reset error message
    this.errorMessage = '';

    // Check required fields
    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.dob || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields.';
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    // Email confirmation
    if (this.email !== this.confirmEmail) {
      this.errorMessage = 'Email addresses do not match.';
      return false;
    }

    // Password validation
    if (this.password.length < 4) {
      this.errorMessage = 'Password must be at least 4 characters long.';
      return false;
    }

    // Password confirmation
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return false;
    }

    // Phone validation (basic)
    if (this.phone.length < 10) {
      this.errorMessage = 'Please enter a valid phone number.';
      return false;
    }

    // How did you find us
    if (!this.selectedSource) {
      this.errorMessage = 'Please select how you heard about us.';
      return false;
    }

    // CAPTCHA validation
    if (!this.captchaCode) {
      this.errorMessage = 'Please enter the CAPTCHA code.';
      return false;
    }

    return true;
  }

  onContinue() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Format date of birth as YYYY-MM-DD
    const dobString = this.dob ? this.formatDate(this.dob) : '';

    const signUpData: SignUpRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      dateOfBirth: dobString,
      howDidYouFindUs: this.selectedSource!.value,
      captcha: this.captchaCode,
      captchaRef: this.captchaRefId
    };

    this.authService.signUp(signUpData).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Check for success (errorCode === 0)
        if (response.errorCode === 0) {
          this.successMessage = 'Account created successfully! Redirecting to sign-in...';
          // Redirect to sign-in page (the page that routes to sign-up)
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          // Sign up failed - show error message
          this.errorMessage = response.errorMessage || 'Sign up failed. Please try again.';
          this.refreshCaptcha();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Sign up error:', error);
        this.errorMessage = error.error?.exceptionMessage || 'An error occurred during sign up. Please try again.';
        this.refreshCaptcha();
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onLogIn() {
    this.router.navigate(['/login']);
  }
}
