import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './authentication/guards/error.interceptor';
import { authInterceptor } from './authentication/guards/auth.interceptor';
import { tokenInterceptor } from './authentication/guards/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([ errorInterceptor, authInterceptor, tokenInterceptor ])
    ),
  ]
};