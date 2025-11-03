import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

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
    CalendarModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  confirmEmail: string = '';
  phone: string = '';
  dob: Date | null = null;
  password: string = '';
  confirmPassword: string = '';
  selectedSource: HearAboutUs | null = null;

  readonly hearAboutUsOptions: HearAboutUs[] = [
    { label: 'Facebook', value: 'facebook' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'X (Twitter)', value: 'twitter' },
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'Word of Mouth/Referral', value: 'referral' },
    { label: 'Email', value: 'email' },
    { label: 'Digital/Print Ads', value: 'ads' },
    { label: 'Customer/Preview Sites', value: 'customer_sites' },
    { label: 'Other', value: 'other' }
  ];

  onContinue() {
    console.log('Sign up data:', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      confirmEmail: this.confirmEmail,
      phone: this.phone,
      dob: this.dob,
      password: this.password,
      confirmPassword: this.confirmPassword,
      source: this.selectedSource
    });
  }

  onLogIn() {
    console.log('Navigate to login');
  }
}
