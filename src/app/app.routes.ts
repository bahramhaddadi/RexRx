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

  // Public route (accessible to everyone)
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(mod => mod.HomeComponent)
  },

  // Protected routes (require authentication)
  {
    path: 'drugs',
    loadComponent: () => import('./pages/drug-list/drug-list.component').then(mod => mod.DrugListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'drug-doses',
    loadComponent: () => import('./pages/drug-dose-selection/drug-dose-selection.component').then(mod => mod.DrugDoseSelectionComponent),
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
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(mod => mod.SettingsComponent),
    canActivate: [authGuard]
  },

  // Default redirect
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
