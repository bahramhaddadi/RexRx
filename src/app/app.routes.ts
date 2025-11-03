import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in.component').then(mod => mod.SignInComponent)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up.component').then(mod => mod.SignUpComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(mod => mod.HomeComponent)
  },
  {
    path: 'drugs',
    loadComponent: () => import('./pages/drug-list/drug-list.component').then(mod => mod.DrugListComponent)
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
