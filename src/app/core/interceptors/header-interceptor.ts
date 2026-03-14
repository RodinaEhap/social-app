import { HttpInterceptorFn } from '@angular/common/http';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    const request = req.clone({
      setHeaders: {
        AUTHORIZATION: `Bearer ${token}`,
      },
    });
    return next(request);
  }
  return next(req);
};
