import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingStore } from '../../state/loading.store';
import { SKIP_GLOBAL_LOADING } from '../http-context.tokens';

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(SKIP_GLOBAL_LOADING)) {
    return next(request);
  }

  const loading = inject(LoadingStore);
  loading.begin();
  return next(request).pipe(finalize(() => loading.end()));
};
