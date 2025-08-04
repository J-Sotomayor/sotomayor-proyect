import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { NavComponent } from './shared/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavComponent],
  template: `
    <app-nav *ngIf="showNav$ | async"></app-nav>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showNav$: Observable<boolean>;

  constructor(private auth: AuthService, private router: Router) {
    // Verifica si el usuario tiene rol → autenticado
    const loggedIn$ = this.auth.role$.pipe(
      map(role => !!role) // true si hay rol (admin o user)
    );

    // Observable del URL actual con valor inicial
    const url$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url) // inicializa con la URL actual
    );

    // Determina si mostrar la barra de navegación
    this.showNav$ = combineLatest([loggedIn$, url$]).pipe(
      map(([loggedIn, url]) => {
        if (!url) return false;
        return (
          loggedIn &&
          !url.startsWith('/login') &&
          !url.startsWith('/register')
        );
      })
    );
  }
}
