import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withHashLocation,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { errorsInterceptor } from './core/interceptors/errors-interceptor';
import { headerInterceptor } from './core/interceptors/header-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withViewTransitions(),
      withHashLocation(),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([errorsInterceptor]),
      withInterceptors([headerInterceptor]),
      withInterceptors([loadingInterceptor]),
    ),

    provideToastr({
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      progressAnimation: 'decreasing',
      easeTime: 500,
      newestOnTop: true,
    }),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
};
