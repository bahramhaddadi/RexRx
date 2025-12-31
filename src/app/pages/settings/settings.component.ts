import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { FileUploadModule } from 'primeng/fileupload';

// Local imports
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { UserService } from '../../services/user.service';
import { UserProfile, UpdatePersonalInfoRequest, UserAddress, CreateUserAddressRequest, UpdateUserAddressRequest, Order, UpdateMedicalHistoryRequest } from '../../models/user.model';

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
    InputTextareaModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    DialogModule,
    CheckboxModule,
    ProgressSpinnerModule,
    PaginatorModule,
    FileUploadModule,
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
    { label: 'Government issued ID', value: 'government-id', icon: 'pi pi-id-card' },
    { label: 'Family doctor', value: 'family-doctor', icon: 'pi pi-heart', disabled: true },
    { label: 'Medical history', value: 'medical-history', icon: 'pi pi-file-edit' },
    { label: 'Orders', value: 'orders', icon: 'pi pi-shopping-bag' },
    { label: 'Prescriptions', value: 'prescriptions', icon: 'pi pi-file', disabled: true }
  ];

  // Loading states
  isLoadingProfile = false;
  isLoadingAddresses = false;
  isSavingProfile = false;
  isSavingAddress = false;
  isLoadingOrders = false;
  isLoadingGovernmentIds = false;
  isUploadingHealthCardFront = false;
  isUploadingHealthCardBack = false;
  isUploadingDrivingLicenseFront = false;
  isUploadingDrivingLicenseBack = false;
  isSavingMedicalHistory = false;

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

  // Cities mapped by province
  citiesByProvince: { [key: string]: string[] } = {
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Spruce Grove', 'Okotoks'],
    'British Columbia': ['Vancouver', 'Victoria', 'Kelowna', 'Abbotsford', 'Surrey', 'Burnaby', 'Richmond', 'Coquitlam', 'Saanich', 'Delta'],
    'Manitoba': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie', 'Winkler', 'Selkirk', 'Morden', 'Dauphin', 'The Pas'],
    'New Brunswick': ['Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Miramichi', 'Bathurst', 'Edmundston', 'Riverview', 'Campbellton', 'Quispamsis'],
    'Newfoundland and Labrador': ['St. John\'s', 'Mount Pearl', 'Corner Brook', 'Conception Bay South', 'Paradise', 'Grand Falls-Windsor', 'Gander', 'Portugal Cove-St. Philip\'s', 'Torbay', 'Happy Valley-Goose Bay'],
    'Nova Scotia': ['Halifax', 'Dartmouth', 'Sydney', 'Truro', 'New Glasgow', 'Glace Bay', 'Kentville', 'Amherst', 'Bridgewater', 'Yarmouth'],
    'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor', 'Richmond Hill', 'Burlington', 'Oshawa', 'Barrie', 'St. Catharines', 'Cambridge', 'Kingston', 'Guelph', 'Whitby', 'Ajax'],
    'Prince Edward Island': ['Charlottetown', 'Summerside', 'Stratford', 'Cornwall', 'Montague', 'Kensington', 'Souris', 'Alberton', 'O\'Leary', 'Georgetown'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Trois-Rivières', 'Terrebonne', 'Saint-Jean-sur-Richelieu', 'Repentigny', 'Brossard', 'Drummondville', 'Saint-Jérôme', 'Granby'],
    'Saskatchewan': ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton', 'North Battleford', 'Estevan', 'Weyburn', 'Warman']
  };

  // Filtered cities based on selected province
  cityOptions: { label: string; value: string }[] = [];

  // Shipping Addresses
  addresses: UserAddress[] = [];
  showAddressDialog = false;
  isEditMode = false;
  addressForm: UserAddress = this.getEmptyAddress();

  // Orders
  orders: Order[] = [];
  ordersSearchCriteria = '';
  ordersSearchInput = '';
  ordersTotalRecords = 0;
  ordersPageNumber = 0;
  ordersPageSize = 10;

  // Government IDs
  healthCardFrontFile: File | null = null;
  healthCardBackFile: File | null = null;
  drivingLicenseFrontFile: File | null = null;
  drivingLicenseBackFile: File | null = null;
  healthCardFrontUrl: string | null = null;
  healthCardBackUrl: string | null = null;
  drivingLicenseFrontUrl: string | null = null;
  drivingLicenseBackUrl: string | null = null;

  // Medical History
  medicalHistoryForm: UpdateMedicalHistoryRequest = {
    allergies: '',
    medications: '',
    surgeries: '',
    otherConditions: ''
  };

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
          // Load medical history data
          this.loadMedicalHistory();
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
      next: (response) => {
        this.addresses = response.body || [];
        this.isLoadingAddresses = false;
      },
      error: (error) => {
        console.error('Error loading user addresses:', error);
        this.errorMessage = 'Failed to load addresses. Please try again.';
        this.addresses = [];
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

    // Update city options when editing an address with a province
    if (this.addressForm.province) {
      this.updateCityOptions(this.addressForm.province);
    }
  }

  /**
   * Updates city options based on selected province
   */
  updateCityOptions(province: string): void {
    const cities = this.citiesByProvince[province] || [];
    this.cityOptions = cities.map(city => ({ label: city, value: city }));
  }

  /**
   * Handles province selection change
   */
  onProvinceChange(): void {
    // Clear city when province changes
    this.addressForm.city = '';
    // Update available cities
    if (this.addressForm.province) {
      this.updateCityOptions(this.addressForm.province);
    } else {
      this.cityOptions = [];
    }
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

      // Load orders when navigating to orders section
      if (sectionValue === 'orders' && this.orders.length === 0) {
        this.loadOrders();
      }
    }
  }

  /**
   * Loads orders with pagination and search
   */
  loadOrders(): void {
    this.isLoadingOrders = true;
    this.errorMessage = '';

    this.userService.getOrders(
      0, // orderStatus: 0 for all statuses
      this.ordersSearchCriteria,
      this.ordersPageNumber,
      this.ordersPageSize
    ).subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          this.orders = response.body.list || [];
          this.ordersTotalRecords = response.body.totalRecords || 0;
        } else {
          console.error('API Error:', response.errorMessage);
          this.errorMessage = response.errorMessage || 'Failed to load orders.';
          this.orders = [];
          this.ordersTotalRecords = 0;
        }
        this.isLoadingOrders = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.orders = [];
        this.ordersTotalRecords = 0;
        this.isLoadingOrders = false;
      }
    });
  }

  /**
   * Handles page change event from paginator
   */
  onOrdersPageChange(event: any): void {
    this.ordersPageNumber = event.page;
    this.ordersPageSize = event.rows;
    this.loadOrders();
  }

  /**
   * Handles search button click
   */
  searchOrders(): void {
    this.ordersSearchCriteria = this.ordersSearchInput.trim();
    this.ordersPageNumber = 0; // Reset to first page
    this.loadOrders();
  }

  /**
   * Handles enter key press in search input
   */
  onOrdersSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchOrders();
    }
  }

  /**
   * Formats order date for display
   */
  formatOrderDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Formats order items for display
   */
  formatOrderItems(order: Order): string {
    if (!order.items || order.items.length === 0) return '';
    return order.items.map(item =>
      `${item.quantity} x ${item.itemName}${item.dose ? ' (' + item.dose + ')' : ''}`
    ).join('\n');
  }

  /**
   * Handles file selection for government ID upload
   */
  onFileSelect(event: any, type: 'HC-F' | 'HC-B' | 'DL-F' | 'DL-B'): void {
    const file = event.files[0];
    if (!file) return;

    // Store the file based on type
    switch (type) {
      case 'HC-F':
        this.healthCardFrontFile = file;
        break;
      case 'HC-B':
        this.healthCardBackFile = file;
        break;
      case 'DL-F':
        this.drivingLicenseFrontFile = file;
        break;
      case 'DL-B':
        this.drivingLicenseBackFile = file;
        break;
    }

    // Upload immediately
    this.uploadGovernmentId(file, type);
  }

  /**
   * Handles direct file input change
   */
  onFileChange(event: Event, type: 'HC-F' | 'HC-B' | 'DL-F' | 'DL-B'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Store the file based on type
    switch (type) {
      case 'HC-F':
        this.healthCardFrontFile = file;
        break;
      case 'HC-B':
        this.healthCardBackFile = file;
        break;
      case 'DL-F':
        this.drivingLicenseFrontFile = file;
        break;
      case 'DL-B':
        this.drivingLicenseBackFile = file;
        break;
    }

    // Upload immediately
    this.uploadGovernmentId(file, type);
  }

  /**
   * Uploads government ID image
   */
  uploadGovernmentId(file: File, type: 'HC-F' | 'HC-B' | 'DL-F' | 'DL-B'): void {
    // Set loading state
    switch (type) {
      case 'HC-F':
        this.isUploadingHealthCardFront = true;
        break;
      case 'HC-B':
        this.isUploadingHealthCardBack = true;
        break;
      case 'DL-F':
        this.isUploadingDrivingLicenseFront = true;
        break;
      case 'DL-B':
        this.isUploadingDrivingLicenseBack = true;
        break;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.userService.uploadGovernmentIdImage(file, type).subscribe({
      next: (response) => {
        if (response.errorCode === 0) {
          this.successMessage = `${this.getDocumentName(type)} uploaded successfully!`;

          // Create preview URL
          const url = URL.createObjectURL(file);
          this.setPreviewUrl(type, url);

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = response.errorMessage || 'Upload failed. Please try again.';
        }
        this.setLoadingState(type, false);
      },
      error: (error) => {
        console.error('Error uploading government ID:', error);
        this.errorMessage = 'Upload failed. Please try again.';
        this.setLoadingState(type, false);
      }
    });
  }

  /**
   * Sets preview URL for uploaded image
   */
  private setPreviewUrl(type: 'HC-F' | 'HC-B' | 'DL-F' | 'DL-B', url: string): void {
    switch (type) {
      case 'HC-F':
        this.healthCardFrontUrl = url;
        break;
      case 'HC-B':
        this.healthCardBackUrl = url;
        break;
      case 'DL-F':
        this.drivingLicenseFrontUrl = url;
        break;
      case 'DL-B':
        this.drivingLicenseBackUrl = url;
        break;
    }
  }

  /**
   * Sets loading state for a specific upload
   */
  private setLoadingState(type: 'HC-F' | 'HC-B' | 'DL-F' | 'DL-B', loading: boolean): void {
    switch (type) {
      case 'HC-F':
        this.isUploadingHealthCardFront = loading;
        break;
      case 'HC-B':
        this.isUploadingHealthCardBack = loading;
        break;
      case 'DL-F':
        this.isUploadingDrivingLicenseFront = loading;
        break;
      case 'DL-B':
        this.isUploadingDrivingLicenseBack = loading;
        break;
    }
  }

  /**
   * Gets human-readable document name
   */
  private getDocumentName(type: 'HC-F' | 'HC-B' | 'DL-F' | 'DL-B'): string {
    const names: { [key: string]: string } = {
      'HC-F': 'Health card (Front)',
      'HC-B': 'Health card (Back)',
      'DL-F': 'Driving license (Front)',
      'DL-B': 'Driving license (Back)'
    };
    return names[type] || 'Document';
  }

  /**
   * Triggers file input click
   */
  triggerFileInput(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  /**
   * Loads medical history from user profile
   */
  loadMedicalHistory(): void {
    if (this.userProfile) {
      this.medicalHistoryForm = {
        allergies: this.userProfile.allergies || '',
        medications: this.userProfile.medications || '',
        surgeries: this.userProfile.surgeries || '',
        otherConditions: this.userProfile.otherConditions || ''
      };
    }
  }

  /**
   * Saves medical history
   */
  saveMedicalHistory(): void {
    this.isSavingMedicalHistory = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.updateMedicalHistory(this.medicalHistoryForm).subscribe({
      next: (response) => {
        this.isSavingMedicalHistory = false;
        if (response.errorCode === 0) {
          this.successMessage = 'Medical history updated successfully!';
          this.loadUserProfile(); // Reload to get fresh data

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = response.errorMessage || 'Failed to update medical history.';
        }
      },
      error: (error) => {
        console.error('Error updating medical history:', error);
        this.errorMessage = 'Failed to update medical history. Please try again.';
        this.isSavingMedicalHistory = false;
      }
    });
  }

  /**
   * Cancels medical history editing and resets form
   */
  cancelMedicalHistory(): void {
    this.loadMedicalHistory();
    this.errorMessage = '';
    this.successMessage = '';
  }
}
