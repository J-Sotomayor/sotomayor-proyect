import { Routes } from '@angular/router';
import { LoginComponent }    from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { NotesComponent }    from './notes/notes.component';
import { AdminComponent }    from './admin/admin.component';
import { UserGuard }         from './core/user-guard';
import { AdminGuard }        from './core/admin-guard';

export const routes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'notes',    component: NotesComponent, canActivate: [UserGuard] },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [UserGuard, AdminGuard]
  },
  { path: '**', redirectTo: 'login' }
];
