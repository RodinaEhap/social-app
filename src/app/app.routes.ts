import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { FeedComponent } from './features/feed/feed.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { authGuard } from './core/auth/guards/auth-guard';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: 'main',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'feed', pathMatch: 'full' },
      { path: 'feed', component: FeedComponent },
      {
        path: 'notification',
        component: NotificationsComponent,
      },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/:id', component: ProfileComponent },
      { path: 'change', component: ChangePasswordComponent },
    ],
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  { path: '**', component: NotFoundComponent },
];
