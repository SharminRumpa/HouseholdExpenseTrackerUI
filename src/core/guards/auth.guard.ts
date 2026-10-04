// // src/core/guards/auth.guard.ts
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const auth = inject(AuthService);
//   const router = inject(Router);

//   if (auth.isLoggedIn()) {          // e.g. token exists and isn't expired
//     const required = route.data?.['permission'] as string | undefined;
//     if (!required || auth.hasPermission(required)) return true;  // for your Role.View style permissions later
//     return router.createUrlTree(['/dashboard']);
//   }

//   return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
// };

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

 
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const menuService = inject(AuthService); // Assuming menuService is also provided by AuthService, adjust if needed
  const router = inject(Router);
 
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
 
  // Menu only lives in memory. A fresh page load restores the logged-in
  // user from storage (so isAuthenticated() is already true above) but
  // creates a brand new MenuService — menuItems() starts empty and nothing
  // else repopulates it. Load it here, once, the first time a guarded
  // route is entered after a reload or a direct URL hit.
  if (menuService.isLoaded()) {
    return true;
  }
 
  return menuService.loadMenu().pipe(
    map(() => true),
    catchError(() => {
      // Token passed the client-side expiry check but the server rejected
      // it (revoked/invalid) — treat that the same as "not authenticated".
      authService.logout();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
 