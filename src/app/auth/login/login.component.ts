import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ]
})
export class LoginComponent implements OnInit {
  hidePassword = true;
  loading = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;

    try {
      await this.auth.login(email, password);
      this.snackBar.open('Bienvenido 👋', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
      this.router.navigate(['/notes']);
    } catch (error: any) {
      let message = 'Error inesperado 😢';
      if (error.code === 'auth/user-not-found') message = 'Usuario no encontrado';
      if (error.code === 'auth/wrong-password') message = 'Contraseña incorrecta';
      this.snackBar.open(message, 'Aceptar', { duration: 4000, panelClass: ['error-snackbar'] });
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    try {
      this.loading = true;
      await this.auth.googleLogin();
      this.snackBar.open('Inicio con Google exitoso ✅', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
      this.router.navigate(['/notes']);
    } catch (error: any) {
      console.error('Error con Google Login:', error);
      this.snackBar.open('Error al iniciar con Google 🚫', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
    } finally {
      this.loading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
