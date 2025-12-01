import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { UserService } from '../../services/user.service';
import { DrugService } from '../../services/drug.service';
import { ShippingAddress, AutocompleteAddressItem } from '../../models/user.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shipping-address',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageLayoutComponent,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule
  ],
  templateUrl: './shipping-address.component.html',
  styleUrls: ['./shipping-address.component.scss']
})
export class ShippingAddressComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly drugService = inject(DrugService);
  private readonly destroy$ = new Subject<void>();
  private readonly streetAddressInput$ = new Subject<string>();

  // Order ID from payment callback
  orderID: string = '';

  // Saved addresses
  savedAddresses: ShippingAddress[] = [];
  selectedSavedAddress: ShippingAddress | null = null;
  isLoadingAddresses = false;
  useMyProfile = false;

  // UI state
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Address form
  addressForm = {
    streetAddress1: '',
    streetAddress2: '',
    apartmentNumber: '',
    city: '',
    province: '',
    postalCode: '',
    specialDeliveryNote: ''
  };

  // Autocomplete
  showAutocompleteSuggestions = false;
  autocompleteSuggestions: AutocompleteAddressItem[] = [];
  isLoadingSuggestions = false;

  // Deliver to mailbox option
  deliverToMailbox = false;

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

  ngOnInit() {
    // Get orderID from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    this.orderID = state?.['orderID'] || '';

    if (!this.orderID) {
      console.warn('No orderID provided in navigation state');
    }

    this.loadSavedAddresses();
    this.setupAutocomplete();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads saved shipping addresses from the API
   */
  loadSavedAddresses() {
    this.isLoadingAddresses = true;
    this.userService.getShippingAddresses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (addresses) => {
          this.savedAddresses = addresses;
          this.isLoadingAddresses = false;
        },
        error: (error) => {
          console.error('Error loading addresses:', error);
          this.isLoadingAddresses = false;
        }
      });
  }

  /**
   * Sets up autocomplete for street address input
   */
  setupAutocomplete() {
    this.streetAddressInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchText) => {
        if (searchText.length >= 5) {
          this.fetchAutocompleteSuggestions(searchText);
        } else {
          this.showAutocompleteSuggestions = false;
          this.autocompleteSuggestions = [];
        }
      });
  }

  /**
   * Handles street address input change
   */
  onStreetAddressInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.streetAddressInput$.next(input.value);
  }

  /**
   * Fetches autocomplete suggestions from the API
   */
  fetchAutocompleteSuggestions(searchText: string) {
    this.isLoadingSuggestions = true;
    this.userService.autocompleteAddress(searchText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.errorCode === 0 && response.body) {
            this.autocompleteSuggestions = response.body;
            this.showAutocompleteSuggestions = this.autocompleteSuggestions.length > 0;
          } else {
            this.autocompleteSuggestions = [];
            this.showAutocompleteSuggestions = false;
          }
          this.isLoadingSuggestions = false;
        },
        error: (error) => {
          console.error('Error fetching autocomplete suggestions:', error);
          this.autocompleteSuggestions = [];
          this.showAutocompleteSuggestions = false;
          this.isLoadingSuggestions = false;
        }
      });
  }

  /**
   * Handles selection of an autocomplete suggestion
   */
  selectSuggestion(suggestion: AutocompleteAddressItem) {
    this.addressForm.streetAddress1 = suggestion.streetAddress1 || suggestion.fullAddress;
    this.addressForm.streetAddress2 = suggestion.streetAddress2 || '';
    this.addressForm.city = suggestion.city || '';
    this.addressForm.province = suggestion.province || '';
    this.addressForm.postalCode = suggestion.postalCode || '';

    this.showAutocompleteSuggestions = false;
    this.autocompleteSuggestions = [];
  }

  /**
   * Handles changes to the "Use my profile" checkbox
   */
  onUseMyProfileChange() {
    if (!this.useMyProfile) {
      // Clear selected address when checkbox is unchecked
      this.selectedSavedAddress = null;
    }
  }

  /**
   * Handles selection of a saved address from dropdown
   */
  onSavedAddressSelect() {
    if (this.selectedSavedAddress) {
      this.addressForm.streetAddress1 = this.selectedSavedAddress.streetAddress1;
      this.addressForm.streetAddress2 = this.selectedSavedAddress.streetAddress2 || '';
      this.addressForm.apartmentNumber = this.selectedSavedAddress.apartmentNumber || '';
      this.addressForm.city = this.selectedSavedAddress.city;
      this.addressForm.province = this.selectedSavedAddress.province;
      this.addressForm.postalCode = this.selectedSavedAddress.postalCode;
    }
  }

  /**
   * Handles form submission
   */
  finish() {
    // Validate required fields
    if (!this.addressForm.streetAddress1 || !this.addressForm.city ||
        !this.addressForm.province || !this.addressForm.postalCode) {
      this.errorMessage = 'Please fill in all required fields (Street Address, City, Province, and Postal Code)';
      return;
    }

    // Validate orderID
    if (!this.orderID) {
      this.errorMessage = 'Order ID is missing. Please try again from the payment page.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare shipping address data
    const shippingData = {
      orderID: this.orderID,
      addressLine1: this.addressForm.streetAddress1,
      addressLine2: this.addressForm.streetAddress2 || '',
      city: this.addressForm.city,
      province: this.addressForm.province,
      postalCode: this.addressForm.postalCode,
      specialInstructions: this.addressForm.specialDeliveryNote || ''
    };

    this.drugService.SetOrderShippingAddress(shippingData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.errorCode === 0) {
            this.successMessage = 'Shipping address saved successfully!';

            // Navigate to home after 1.5 seconds
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1500);
          } else {
            this.errorMessage = response.errorMessage || 'Failed to save shipping address';
            console.error('API Error:', response.errorMessage);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to save shipping address. Please try again.';
          console.error('Error saving shipping address:', error);
        }
      });
  }
}
