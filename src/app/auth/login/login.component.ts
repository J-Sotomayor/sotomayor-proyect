import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from '../../shared/material.module';
import { AuthService }    from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  hide = true;
  loading = false;
  error: string | null = null;

  constructor(
    fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // Cambiamos 'username' por 'email'
    this.form = fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.error   = null;
    this.loading = true;

    // Desestructuramos 'email' en vez de 'username'
    const { email, password, remember } = this.form.value;
    this.auth
      .login(email, password, remember)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(ok => {
        if (ok) {
          this.router.navigate(['/notes']);
        } else {
          this.error = 'Email o contraseña inválidos';
        }
      });
  }

  loginWithGoogle() {
    this.error   = null;
    this.loading = true;
    this.auth
      .loginWithGoogle()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(ok => {
        if (ok) {
          this.router.navigate(['/notes']);
        } else {
          this.error = 'Error en login con Google';
        }
      });
  }
}
