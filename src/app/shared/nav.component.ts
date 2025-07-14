// src/app/shared/nav.component.ts
import { Component }     from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule }  from '@angular/router';
import { Observable }    from 'rxjs';
import { AuthService }   from '../auth/auth.service';
import { MaterialModule } from './material.module';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  role$: Observable<'user'|'admin'|null>;

  constructor(private auth: AuthService) {
    // Ahora sí se puede usar this.auth
    this.role$ = this.auth.role$;
  }

  logout() {
    this.auth.logout().then(() => {
      // Opcional: redirigir a /login
    });
  }
}
