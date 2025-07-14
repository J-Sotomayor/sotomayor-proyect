import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { routes }            from '../app.routes';
import { AuthService }       from './auth.service';
import { LoginComponent }    from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    LoginComponent,        // módulo standalone
    RegisterComponent      // módulo standalone
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule {}
