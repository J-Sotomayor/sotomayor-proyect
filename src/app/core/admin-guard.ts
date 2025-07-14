import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService, Role } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.role$.pipe(
      // Espera a que role$ emita un valor distinto de null
      filter((role): role is Role => role !== null),
      take(1),
      map(role =>
        role === 'admin'
          ? true
          : this.router.createUrlTree(['/notes'])
      )
    );
  }
}