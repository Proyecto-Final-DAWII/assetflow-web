import { HttpInterceptorFn } from '@angular/common/http';

export const requestIdInterceptor: HttpInterceptorFn = (request, next) => {
  const requestId = crypto.randomUUID();
  return next(
    request.clone({
      setHeaders: {
        'X-Request-Id': requestId,
        'X-Correlation-Id': requestId,
      },
    }),
  );
};
