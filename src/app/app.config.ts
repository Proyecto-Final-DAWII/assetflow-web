import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { RuntimeConfigService } from './core/config/runtime-config.service';
import { authInterceptor } from './core/http/interceptors/auth.interceptor';
import { errorInterceptor } from './core/http/interceptors/error.interceptor';
import { loadingInterceptor } from './core/http/interceptors/loading.interceptor';
import { requestIdInterceptor } from './core/http/interceptors/request-id.interceptor';
import { timeoutInterceptor } from './core/http/interceptors/timeout.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        requestIdInterceptor,
        loadingInterceptor,
        errorInterceptor,
        timeoutInterceptor,
      ]),
    ),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideAppInitializer(() => inject(RuntimeConfigService).load()),
  ],
};
