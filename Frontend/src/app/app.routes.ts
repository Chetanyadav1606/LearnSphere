import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'activate-account',
    loadComponent: () =>
      import('./pages/activate-account/activate-account.component').then(m => m.ActivateAccountComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./pages/courses/courses.component').then(m => m.CoursesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'course/:id',
    loadComponent: () =>
      import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'manage-course/:id',
    loadComponent: () =>
      import('./pages/manage-course/manage-course.component').then(m => m.ManageCourseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'test/:id',
    loadComponent: () =>
      import('./pages/take-test/take-test.component').then(m => m.TakeTestComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./pages/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
