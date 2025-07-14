import { importProvidersFrom }       from '@angular/core';
import { BrowserAnimationsModule }   from '@angular/platform-browser/animations';
import { provideRouter }             from '@angular/router';
import { provideFirebaseApp,
         initializeApp }             from '@angular/fire/app';
import { provideAuth,
         getAuth }                   from '@angular/fire/auth';
import { provideFirestore,
         getFirestore }              from '@angular/fire/firestore';

import { AppComponent }              from './app.component';
import { MaterialModule }            from './shared/material.module';
import { AuthModule }                from './auth/auth.module';
import { routes }                    from './app.routes';
import { environment }               from '../environments/environment';

export const appConfig = {
  providers: [
    // Solo NgModules aquí
    importProvidersFrom(
      BrowserAnimationsModule,
      MaterialModule,
      AuthModule
    ),

    // Providers de AngularFire fuera de importProvidersFrom
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    // Finalmente el router
    provideRouter(routes)
  ]
};