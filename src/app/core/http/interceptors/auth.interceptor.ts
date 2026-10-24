import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RuntimeConfigService } from '../../config/runtime-config.service';
import { SessionStore } from '../../auth/session.store';
import { SKIP_AUTH } from '../http-context.tokens';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(SKIP_AUTH)) {
    return next(request);
  }

  const session = inject(SessionStore);
  const locale = inject(RuntimeConfigService).snapshot().app.locale;
  const token = session.accessToken();

  return next(
    request.clone({
      setHeaders: {
        Accept: 'application/json',
        'Accept-Language': locale,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }),
  );
};
