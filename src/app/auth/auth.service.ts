import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  docData
} from '@angular/fire/firestore';
import { Observable, of, switchMap, map, throwError } from 'rxjs';

export type Role = 'admin' | 'user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observables para guards
  user$: Observable<User | null>;
  role$: Observable<Role>;

  constructor() {
    // Escucha de cambios en sesión
    this.user$ = new Observable<User | null>((subscriber) => {
      return this.auth.onAuthStateChanged(subscriber);
    });

    // Rol y validación de bloqueo desde Firestore
    this.role$ = this.user$.pipe(
      switchMap((user) => {
        if (!user) return of('user' as Role); // rol por defecto si no hay sesión
        const ref = doc(this.firestore, 'users', user.uid);
        return docData(ref).pipe(
          map((data: any) => {
            if (!data) return 'user' as Role;

            // 👇 Si está bloqueado, lanzamos error
            if (data.blocked) {
              throw new Error('🚫 Tu cuenta ha sido bloqueada por un administrador.');
            }

            return (data?.role as Role) || 'user';
          })
        );
      })
    );
  }

  // Registro con email y contraseña
  async register(email: string, password: string, displayName: string, phone?: string) {
    try {
      const cred: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      if (cred.user) {
        await updateProfile(cred.user, { displayName });

        // Guardamos datos en Firestore
        await setDoc(doc(this.firestore, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName,
          phone: phone || '',
          role: 'user', // 👈 por defecto
          blocked: false, // 👈 inicialmente no bloqueado
          createdAt: new Date()
        });
      }

      return cred;
    } catch (error: any) {
      console.error('Error en register:', error.message);
      throw error;
    }
  }

  // Inicio de sesión con email y contraseña
  async login(email: string, password: string) {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);

      // Validamos si está bloqueado
      const userRef = doc(this.firestore, 'users', cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data()?.['blocked']) {

        await this.logout();
        throw new Error('🚫 Tu cuenta está bloqueada. Contacta al administrador.');
      }

      return cred;
    } catch (error: any) {
      console.error('Error en login:', error.message);
      throw error;
    }
  }

  // Inicio de sesión con Google
  async googleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this.auth, provider);

      if (cred.user) {
        const userRef = doc(this.firestore, 'users', cred.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName || '',
            photoURL: cred.user.photoURL || '',
            phone: cred.user.phoneNumber || '',
            role: 'user', // 👈 siempre por defecto en Google login
            blocked: false,
            createdAt: new Date()
          });
        } else if (userSnap.data()?.['blocked']) {

          await this.logout();
          throw new Error('🚫 Tu cuenta está bloqueada. Contacta al administrador.');
        }
      }

      return cred;
    } catch (error: any) {
      console.error('Error en googleLogin:', error.message);
      throw error;
    }
  }
  // Resetear contraseña
async sendPasswordReset(email: string) {
  try {
    return await sendPasswordResetEmail(this.auth, email);
  } catch (error: any) {
    console.error('Error en reset password:', error.message);
    throw error;
  }
}


  // Cerrar sesión
  async logout() {
    try {
      return await signOut(this.auth);
    } catch (error: any) {
      console.error('Error en logout:', error.message);
      throw error;
    }
  }

  // Usuario actual sincrónico
  getCurrentUser() {
    return this.auth.currentUser;
  }
}
