import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  docData,
  setDoc,
  getDoc
} from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';

export type Role = 'user' | 'admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public role$: Observable<Role | null>;
  private _roleCache: Role | null = null;

  constructor(private auth: Auth, private afs: Firestore) {
    this.role$ = authState(this.auth).pipe(
      switchMap(user => {
        if (!user) {
          this._roleCache = null;
          return of(null);
        }
        return docData(doc(this.afs, 'users', user.uid)).pipe(
          map((data: any) => {
            const role = (data?.['role'] as Role) ?? 'user';
            this._roleCache = role;
            return role;
          })
        );
      })
    );
    // Inicializar cache de rol
    this.role$.pipe(take(1)).subscribe();
  }

  /** Recarga el cache de rol manualmente */
  initRoleCache(): void {
    this.role$.pipe(take(1)).subscribe();
  }

  /** Verificación síncrona de autenticación */
  isLoggedInSync(): boolean {
    return this._roleCache !== null;
  }

  /** Verificación síncrona de rol admin */
  isAdminSync(): boolean {
    return this._roleCache === 'admin';
  }

  /** Login con email/password y persistencia */
  login(email: string, password: string, remember = false): Observable<boolean> {
    const persistence = remember
      ? browserLocalPersistence
      : browserSessionPersistence;

    return from(setPersistence(this.auth, persistence)).pipe(
      switchMap(() =>
        from(signInWithEmailAndPassword(this.auth, email, password))
      ),
      switchMap(cred => from(getDoc(doc(this.afs, 'users', cred.user!.uid)))),
      map(snap => {
        const role = (snap.data()?.['role'] as Role) ?? 'user';
        this._roleCache = role;
        return true;
      }),
      catchError(() => of(false))
    );
  }

  /** Registro con email/password y creación de documento de usuario */
  signup(email: string, password: string): Observable<void> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap(cred =>
        from(
          setDoc(doc(this.afs, 'users', cred.user!.uid), {
            role: 'user',
            blocked: false
          })
        )
      )
    );
  }

  /** Login con Google */
  loginWithGoogle(): Observable<boolean> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** Cerrar sesión y limpiar cache de rol */
  logout(): Promise<void> {
    return this.auth.signOut().then(() => {
      this._roleCache = null;
    });
  }
}
