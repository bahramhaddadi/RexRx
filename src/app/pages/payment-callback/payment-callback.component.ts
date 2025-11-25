import { Component, OnInit, inject } from '@angular/core';
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
export class PaymentCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  paymentStatus: 'success' | 'failed' | 'pending' = 'pending';
  sessionId: string = '';

  ngOnInit() {
    // Get payment status from query parameters
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'] || '';

      // Stripe typically sends 'success' or redirects with session_id for success
      // and may include 'canceled' for failed payments
      if (params['success'] === 'true' || params['payment_status'] === 'success') {
        this.paymentStatus = 'success';
      } else if (params['canceled'] === 'true' || params['payment_status'] === 'failed') {
        this.paymentStatus = 'failed';
      } else if (this.sessionId) {
        // If we have a session_id, assume success
        this.paymentStatus = 'success';
      } else {
        this.paymentStatus = 'failed';
      }
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
