import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { timeout } from 'rxjs';
import { RuntimeConfigService } from '../../config/runtime-config.service';

export const timeoutInterceptor: HttpInterceptorFn = (request, next) => {
  const timeoutMs = inject(RuntimeConfigService).snapshot().api.timeoutMs;
  return next(request).pipe(timeout({ each: timeoutMs }));
};
