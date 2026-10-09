import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service'; // Adjust path as needed

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const successMessage =
          (event.body as { message?: string } | null)?.message ||
          'Operation completed successfully.';
        toastService.success(successMessage);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected network error occurred.';

      if (error.error?.message) {
        message = error.error.message;
      } else if (error.status === 0) {
        message = 'Unable to connect to the server.';
      } else if (error.status >= 500) {
        message = `Server Error (${error.status}): Please try again later.`;
      }

      toastService.error(message);
      return throwError(() => error);
    }),
  );
};
