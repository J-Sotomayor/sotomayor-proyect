import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminComponent } from './admin/admin.component';
import { ProfileComponent } from './profile/profile.component';
import { UserGuard } from './core/user-guard';
import { AdminGuard } from './core/admin-guard';
import { NotesComponent } from './notes/notes.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [UserGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'notes', component: NotesComponent, canActivate: [UserGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirige a login cuando la ruta es vacía
  { path: '**', redirectTo: 'login' }  // Redirige cualquier ruta desconocida a login
];
