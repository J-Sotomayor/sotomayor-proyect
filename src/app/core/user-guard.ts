import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export const UserGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.role$.pipe(
    map((role) => role === 'user' || role === 'admin'), // 👈 admin también puede pasar
    tap((isUser) => {
      if (!isUser) {
        router.navigate(['/login']); // redirige si no es user
      }
    })
  );
};
