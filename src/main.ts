import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
} else {
  console.log('Angular en modo desarrollo');
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error('Error al iniciar la aplicación:', err));
