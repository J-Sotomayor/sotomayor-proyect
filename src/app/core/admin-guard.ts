import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.role$.pipe(
    map((role) => role === 'admin'),
    tap((isAdmin) => {
      if (!isAdmin) {
        router.navigate(['/login']); // si no es admin, lo mando al login
      }
    })
  );
};
