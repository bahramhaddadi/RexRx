import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [
    CommonModule,
    PageLayoutComponent,
    CardModule,
    ButtonModule
  ],
  templateUrl: './payment-callback.component.html',
  styleUrls: ['./payment-callback.component.scss']
})
export class PaymentCallbackComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  paymentStatus: 'success' | 'failed' | 'pending' = 'pending';
  sessionId: string = '';
  orderId: string = '';
  countdown: number = 5;
  private countdownInterval?: any;

  ngOnInit() {
    // Get payment status from query parameters
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'] || '';
      this.orderId = params['orderId'] || '';
      
      // Stripe typically sends 'success' or redirects with session_id for success
      // and may include 'canceled' for failed payments
      if (params['success'] === 'true' || params['payment_status'] === 'success') {
        this.paymentStatus = 'success';
        this.startRedirectCountdown();
      } else if (params['canceled'] === 'true' || params['payment_status'] === 'failed') {
        this.paymentStatus = 'failed';
      } else if (this.sessionId) {
        // If we have a session_id, assume success
        this.paymentStatus = 'success';
        this.startRedirectCountdown();
      } else {
        this.paymentStatus = 'failed';
      }
    });
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  /**
   * Starts a 5-second countdown and redirects to shipping address page
   */
  startRedirectCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/shipping-address'], {
          state: { orderID: this.orderId }
        });
      }
    }, 1000);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToShippingAddress() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/shipping-address'], {
      state: { orderID: this.sessionId }
    });
  }
}
