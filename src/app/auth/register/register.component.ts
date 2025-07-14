// src/app/auth/register/register.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from '../../shared/material.module';
import { AuthService }    from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  hide = true;
  hideConfirm = true;
  loading = false;
  submitted = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      phone:           ['', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordsMatch
    });
  }

  /** Acceso rápido a los controles desde la plantilla */
  get f() {
    return this.form.controls;
  }

  /** Valida que password y confirmPassword coincidan */
  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pwd  = group.get('password')?.value;
    const conf = group.get('confirmPassword')?.value;
    return pwd === conf ? null : { noMatch: true };
  }

  /** Se llama al pulsar “Register” */
  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.error   = null;
    this.loading = true;
    const { email, password } = this.form.value;

    this.auth
      .signup(email, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.router.navigate(['/notes']),
        error: () => (this.error = 'Error al registrar usuario')
      });
  }

  /** Login con Google */
  loginWithGoogle() {
    this.error   = null;
    this.loading = true;
    this.auth
      .loginWithGoogle()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(ok => {
        if (ok) this.router.navigate(['/notes']);
        else this.error = 'Error en login con Google';
      });
  }
}
