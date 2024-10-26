import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { DatePipe } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers:  [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    DatePipe
  ]
};
