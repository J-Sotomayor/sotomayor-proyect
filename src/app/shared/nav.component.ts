import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;

  // router ahora es PUBLIC para poder usarlo en el HTML
  constructor(public auth: AuthService, public router: Router) {
    this.isLoggedIn$ = this.auth.user$.pipe(map(user => !!user));
    this.isAdmin$ = this.auth.role$.pipe(map(role => role === 'admin'));
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
