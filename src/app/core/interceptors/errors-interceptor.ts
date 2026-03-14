import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, tap, throwError } from 'rxjs';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const toastrService = inject(ToastrService);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as any;

        if (body.message === 'signed in successfully' && body.data.token) {
          toastrService.success('Welcome Back! Happy to see you again', 'Login Success');
        } else if (body.message === 'account created' && body.data.token) {
          toastrService.success('Account Created Successfully!', 'Registration Success');
        }
      }
    }),
    catchError((err) => {
      console.log('API Error Detected:', err);
      const errorMsg = err.error?.message || 'Error occurred';
      toastrService.error(errorMsg, 'Social Vibe');
      return throwError(() => err);
    }),
  );
};
