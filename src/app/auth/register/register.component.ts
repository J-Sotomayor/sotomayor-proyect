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
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
export class RegisterComponent implements OnInit {
  hidePassword = true;
  loading = false;
  form!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['']
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    const { name, email, password, phone } = this.form.value;

    try {
      await this.auth.register(email, password, name, phone);
      this.snackBar.open('Registro exitoso 🎉', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Error en registro:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'El correo ya está registrado 🚫';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'El correo no es válido 📧';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'La contraseña es demasiado débil 🔑';
      } else {
        this.errorMessage = 'Ocurrió un error inesperado 😢';
      }
      this.snackBar.open(this.errorMessage, 'Aceptar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading = false;
    }
  }

  async googleRegister() {
    try {
      this.loading = true;
      await this.auth.googleLogin();
      this.snackBar.open('Registro con Google exitoso ✅', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/notes']);
    } catch (error: any) {
      console.error('Error con Google:', error);
      this.snackBar.open('Error al registrarse con Google 🚫', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
