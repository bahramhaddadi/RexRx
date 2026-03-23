import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Guest-only routes (redirect to home if authenticated)
  {
    path: 'login',
    loadComponent: () => import('./pages/sign-in/sign-in.component').then(mod => mod.SignInComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up.component').then(mod => mod.SignUpComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(mod => mod.ResetPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password-request',
    loadComponent: () => import('./pages/reset-password-request/reset-password-request.component').then(mod => mod.ResetPasswordRequestComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'tadalafil',
    loadComponent: () => import('./pages/tadalafil/tadalafil.component').then(mod => mod.TadalafilComponent),
    pathMatch: 'full'
  },
  {
    path: 'sildenafil',
    loadComponent: () => import('./pages/sildenafil/sildenafil.component').then(mod => mod.SildenafilComponent),
    pathMatch: 'full'
  },
  {
    path: 'ozempic',
    loadComponent: () => import('./pages/ozempic/ozempic.component').then(mod => mod.OzempicComponent),
    pathMatch: 'full'
  },
  {
    path: 'mounjaro',
    loadComponent: () => import('./pages/mounjaro/mounjaro.component').then(mod => mod.MounjaroComponent),
    pathMatch: 'full'
  },
  {
    path: 'wegovy',
    loadComponent: () => import('./pages/wegovy/wegovy.component').then(mod => mod.WegovyComponent),
    pathMatch: 'full'
  },
  {
    path: 'finasteride-minoxidil',
    loadComponent: () => import('./pages/finasteride-minoxidil/finasteride-minoxidil.component').then(mod => mod.FinasterideMinoxidilComponent),
    pathMatch: 'full'
  },
  {
    path: 'truvada',
    loadComponent: () => import('./pages/truvada/truvada.component').then(mod => mod.TruvadaComponent),
    pathMatch: 'full'
  },


  // Public route (accessible to everyone)
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(mod => mod.HomeComponent),
    pathMatch: 'full'
  },

  // Protected routes (require authentication)
  {
    path: 'drugs',
    loadComponent: () => import('./pages/drug-list/drug-list.component').then(mod => mod.DrugListComponent),
    // pathMatch: 'full'
    canActivate: [authGuard]
  },
  {
    path: 'drug-doses',
    loadComponent: () => import('./pages/drug-dose-selection/drug-dose-selection.component').then(mod => mod.DrugDoseSelectionComponent),
    // pathMatch: 'full'
    canActivate: [authGuard]
  },
  {
    path: 'drug-questions',
    loadComponent: () => import('./pages/drug-questions/drug-questions.component').then(mod => mod.DrugQuestionsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'drug-recommendations',
    loadComponent: () => import('./pages/drug-recommendations/drug-recommendations.component').then(mod => mod.DrugRecommendationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'drug-summary',
    loadComponent: () => import('./pages/drug-summary/drug-summary.component').then(mod => mod.DrugSummaryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ResumeShoppingCart',
    loadComponent: () => import('./pages/resume-shopping-cart/resume-shopping-cart.component').then(mod => mod.ResumeShoppingCartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(mod => mod.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment',
    loadComponent: () => import('./pages/payment-callback/payment-callback.component').then(mod => mod.PaymentCallbackComponent),
    canActivate: [authGuard]
  },
  {
    path: 'shipping-address',
    loadComponent: () => import('./pages/shipping-address/shipping-address.component').then(mod => mod.ShippingAddressComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(mod => mod.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'support-chat',
    loadComponent: () => import('./pages/support-chat/support-chat.component').then(mod => mod.SupportChatComponent),
    canActivate: [authGuard]
  },

  // Fallback redirect
  {
    path: '**',
    redirectTo: '',
  },
];
