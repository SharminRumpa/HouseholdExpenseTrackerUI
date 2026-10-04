// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LayoutComponent } from '../layout/layout/layout.component';
import { authGuard } from '../core/guards/auth.guard';

export interface RouteMenuItem {
  path: string;
  title: string;
  icon?: string;
  permission?: string; // Maps to dbo.Permissions.PermissionCode
  children?: RouteMenuItem[];
}

// src/app/app.routes.ts
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('../pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],        // blocks entering the layout at all
    canActivateChild: [authGuard],   // re-checks on every child navigation
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },  // guard sends guests to /login
      { path: 'dashboard', loadComponent: () => import('../pages/dashboard/dashboard.component').then(m => m.DashboardComponent), data: { title: 'Dashboard' } },
      { path: 'income', loadComponent: () => import('../pages/income/income.component').then(m => m.IncomeComponent), data: { title: 'Income' } },
      { path: 'expense', loadComponent: () => import('../pages/expense/expense.component').then(m => m.ExpenseComponent), data: { title: 'Expense' } },
      { path: 'categories', loadComponent: () => import('../pages/categories/categories.component').then(m => m.CategoriesComponent), data: { title: 'Expense Categories' } },
      { path: 'sub-categories', loadComponent: () => import('../pages/categories/sub-categories.component').then(m => m.SubCategoriesComponent), data: { title: 'Expense Sub-categories' } },
      { path: 'income-categories', loadComponent: () => import('../pages/income-categories/income-categories.component').then(m => m.IncomeCategoriesComponent), data: { title: 'Income categories' } },
      { path: 'users', loadComponent: () => import('../pages/users/user.component').then(m => m.UserComponent), data: { title: 'Users' } },
    ]
  },
  { path: '**', redirectTo: '' }
];

// export const routes: Routes = [
//   {
//     path: 'login',
//     loadComponent: () => import('../pages/login/login.component').then((m) => m.LoginComponent)
//   },
//   {
//     path: 'register',
//     loadComponent: () =>
//       import('../pages/register/register.component').then((m) => m.RegisterComponent)
//   },
//   {
//     path: '',
//     component: LayoutComponent,
//     children: [
//       { path: '', pathMatch: 'full', redirectTo: 'login' },
//       //{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
//       {
//         path: 'dashboard',
//         loadComponent: () =>
//           import('../pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
//         data: { title: 'Dashboard' }
//       },
//       {
//         path: 'income',
//         loadComponent: () =>
//           import('../pages/income/income.component').then((m) => m.IncomeComponent),
//         data: { title: 'Income' }
//       },
//       {
//         path: 'expense',
//         loadComponent: () =>
//           import('../pages/expense/expense.component').then((m) => m.ExpenseComponent),
//         data: { title: 'Expense' }
//       },
//       {
//         path: 'categories',
//         loadComponent: () =>
//           import('../pages/categories/categories.component').then((m) => m.CategoriesComponent),
//         data: { title: 'Categories' }
//       },
//       {
//         path: 'income-categories',
//         loadComponent: () =>
//           import('../pages/income-categories/income-categories.component').then(
//             (m) => m.IncomeCategoriesComponent
//           ),
//         data: { title: 'Income categories' }
//       },
//       {
//         path: 'users',
//         loadComponent: () =>
//           import('../pages/users/user.component').then((m) => m.UserComponent),
//         data: { title: 'Users' }
//       },
//       // {
//       //   path: 'roles',
//       //   loadComponent: () =>
//       //     import('../pages/roles/role.component').then((m) => m.RoleComponent),
//       //   data: { title: 'Roles' }
//       // },
//       // {
//       //   path: 'roles',
//       //   component: RoleListComponent,
//       //   canActivate: [authGuard],
//       //   data: { permission: 'Role.View', title: 'Roles', icon: 'admin_panel_settings' }
//       // },
//     ]
//   },
//   { path: '**', redirectTo: 'dashboard' }
// ];