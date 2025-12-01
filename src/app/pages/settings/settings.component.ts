import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Local imports
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { UserService } from '../../services/user.service';
import { UserProfile, UpdatePersonalInfoRequest, UserAddress, CreateUserAddressRequest, UpdateUserAddressRequest } from '../../models/user.model';

interface MenuItem {
  label: string;
  value: string;
  icon: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    DialogModule,
    CheckboxModule,
    ProgressSpinnerModule,
    PageLayoutComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // Navigation
  selectedSection: string = 'personal-info';
  menuItems: MenuItem[] = [
    { label: 'Personal info', value: 'personal-info', icon: 'pi pi-user' },
    { label: 'Shipping address', value: 'shipping-address', icon: 'pi pi-map-marker' },
    { label: 'Government issued ID', value: 'government-id', icon: 'pi pi-id-card', disabled: true },
    { label: 'Family doctor', value: 'family-doctor', icon: 'pi pi-heart', disabled: true },
    { label: 'Medical history', value: 'medical-history', icon: 'pi pi-file-edit', disabled: true },
    { label: 'Orders', value: 'orders', icon: 'pi pi-shopping-bag', disabled: true },
    { label: 'Prescriptions', value: 'prescriptions', icon: 'pi pi-file', disabled: true }
  ];

  // Loading states
  isLoadingProfile = false;
  isLoadingAddresses = false;
  isSavingProfile = false;
  isSavingAddress = false;

  // Personal Info
  userProfile: UserProfile | null = null;
  personalInfoForm: UpdatePersonalInfoRequest = {
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: ''
  };
  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
    { label: 'Prefer not to say', value: 'Prefer not to say' }
  ];

  // Province options for Canadian provinces
  provinceOptions = [
    { label: 'Alberta', value: 'Alberta' },
    { label: 'British Columbia', value: 'British Columbia' },
    { label: 'Manitoba', value: 'Manitoba' },
    { label: 'New Brunswick', value: 'New Brunswick' },
    { label: 'Newfoundland and Labrador', value: 'Newfoundland and Labrador' },
    { label: 'Nova Scotia', value: 'Nova Scotia' },
    { label: 'Ontario', value: 'Ontario' },
    { label: 'Prince Edward Island', value: 'Prince Edward Island' },
    { label: 'Quebec', value: 'Quebec' },
    { label: 'Saskatchewan', value: 'Saskatchewan' }
  ];

  // Shipping Addresses
  addresses: UserAddress[] = [];
  showAddressDialog = false;
  isEditMode = false;
  addressForm: UserAddress = this.getEmptyAddress();

  // Error handling
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserAddresses();
  }

  /**
   * Loads user profile data
   */
  loadUserProfile(): void {
    this.isLoadingProfile = true;
    this.errorMessage = '';

    this.userService.getUserProfile().subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          this.userProfile = response.body;
          this.personalInfoForm = {
            firstName: response.body.firstName || '',
            middleName: response.body.middleName || '',
            lastName: response.body.lastName || '',
            dateOfBirth: response.body.dateOfBirth || '',
            gender: response.body.gender || '',
            phone: response.body.phone || ''
          };
        } else {
          console.error('API Error:', response.errorMessage);
          this.errorMessage = response.errorMessage || 'Failed to load user profile.';
        }
        this.isLoadingProfile = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.errorMessage = 'Failed to load user profile. Please try again.';
        this.isLoadingProfile = false;
      }
    });
  }

  /**
   * Loads user shipping addresses
   */
  loadUserAddresses(): void {
    this.isLoadingAddresses = true;
    this.errorMessage = '';

    this.userService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses || [];
        this.isLoadingAddresses = false;
      },
      error: (error) => {
        console.error('Error loading user addresses:', error);
        this.errorMessage = 'Failed to load addresses. Please try again.';
        this.isLoadingAddresses = false;
      }
    });
  }

  /**
   * Saves personal info changes
   */
  savePersonalInfo(): void {
    this.isSavingProfile = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.updatePersonalInfo(this.personalInfoForm).subscribe({
      next: (response) => {
        this.isSavingProfile = false;
        this.successMessage = 'Personal information updated successfully!';
        this.loadUserProfile(); // Reload to get fresh data

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating personal info:', error);
        this.errorMessage = 'Failed to update personal information. Please try again.';
        this.isSavingProfile = false;
      }
    });
  }

  /**
   * Cancels personal info editing and resets form
   */
  cancelPersonalInfo(): void {
    if (this.userProfile) {
      this.personalInfoForm = {
        firstName: this.userProfile.firstName || '',
        middleName: this.userProfile.middleName || '',
        lastName: this.userProfile.lastName || '',
        dateOfBirth: this.userProfile.dateOfBirth || '',
        gender: this.userProfile.gender || '',
        phone: this.userProfile.phone || ''
      };
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Opens dialog to add new address
   */
  addNewAddress(): void {
    this.isEditMode = false;
    this.addressForm = this.getEmptyAddress();
    this.showAddressDialog = true;
  }

  /**
   * Opens dialog to edit existing address
   */
  editAddress(address: UserAddress): void {
    this.isEditMode = true;
    this.addressForm = { ...address };
    this.showAddressDialog = true;
  }

  /**
   * Saves address (create or update)
   */
  saveAddress(): void {
    this.isSavingAddress = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isEditMode && this.addressForm.id) {
      // Update existing address
      const updateRequest: UpdateUserAddressRequest = {
        id: this.addressForm.id,
        nickName: this.addressForm.nickName,
        streetAddress1: this.addressForm.streetAddress1,
        streetAddress2: this.addressForm.streetAddress2,
        apartmentNumber: this.addressForm.apartmentNumber,
        city: this.addressForm.city,
        province: this.addressForm.province,
        postalCode: this.addressForm.postalCode,
        isDefault: this.addressForm.isDefault
      };

      this.userService.updateUserAddress(updateRequest).subscribe({
        next: (response) => {
          this.isSavingAddress = false;
          this.showAddressDialog = false;
          this.successMessage = 'Address updated successfully!';
          this.loadUserAddresses(); // Reload addresses

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating address:', error);
          this.errorMessage = 'Failed to update address. Please try again.';
          this.isSavingAddress = false;
        }
      });
    } else {
      // Create new address
      const createRequest: CreateUserAddressRequest = {
        nickName: this.addressForm.nickName,
        streetAddress1: this.addressForm.streetAddress1,
        streetAddress2: this.addressForm.streetAddress2,
        apartmentNumber: this.addressForm.apartmentNumber,
        city: this.addressForm.city,
        province: this.addressForm.province,
        postalCode: this.addressForm.postalCode,
        isDefault: this.addressForm.isDefault
      };

      this.userService.createUserAddress(createRequest).subscribe({
        next: (response) => {
          this.isSavingAddress = false;
          this.showAddressDialog = false;
          this.successMessage = 'Address created successfully!';
          this.loadUserAddresses(); // Reload addresses

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error creating address:', error);
          this.errorMessage = 'Failed to create address. Please try again.';
          this.isSavingAddress = false;
        }
      });
    }
  }

  /**
   * Cancels address editing
   */
  cancelAddress(): void {
    this.showAddressDialog = false;
    this.addressForm = this.getEmptyAddress();
    this.errorMessage = '';
  }

  /**
   * Returns an empty address object
   */
  private getEmptyAddress(): UserAddress {
    return {
      nickName: '',
      streetAddress1: '',
      streetAddress2: '',
      apartmentNumber: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: false
    };
  }

  /**
   * Navigates to a different section
   */
  navigateToSection(sectionValue: string): void {
    if (!this.menuItems.find(item => item.value === sectionValue)?.disabled) {
      this.selectedSection = sectionValue;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }
}
