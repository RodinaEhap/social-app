import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../auth/services/loading.service';
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  if (req.headers.has('Skip-Loading')) {
    const modifiedReq = req.clone({
      headers: req.headers.delete('Skip-Loading'),
    });
    return next(modifiedReq);
  }
  //without ignoring
  loadingService.show();
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    }),
  );
};
