import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth/auth.service';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ]
})
export class AdminComponent implements OnInit {
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);

  users$: Observable<any[]>;
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
  dataSource: any[] = [];

  constructor() {
    const usersRef = collection(this.firestore, 'users');
    this.users$ = collectionData(usersRef, { idField: 'id' });
  }

  ngOnInit(): void {
    this.users$.subscribe(users => {
      this.dataSource = users || [];
    });
  }

  async makeAdmin(userId: string) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDoc(userRef, { role: 'admin' });
    this.snackBar.open('✅ Usuario ahora es Admin', 'Cerrar', { duration: 3000 });
  }

  async makeUser(userId: string) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDoc(userRef, { role: 'user' });
    this.snackBar.open('✅ Usuario ahora es User', 'Cerrar', { duration: 3000 });
  }

  async toggleBlock(userId: string, currentStatus: boolean) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDoc(userRef, { blocked: !currentStatus });
    this.snackBar.open(`🔒 Usuario ${!currentStatus ? 'bloqueado' : 'desbloqueado'}`, 'Cerrar', { duration: 3000 });
  }

  async resetPassword(email: string) {
    try {
      await this.auth.sendPasswordReset(email);
      this.snackBar.open(`📧 Correo enviado a ${email} para resetear contraseña`, 'Cerrar', { duration: 4000 });
    } catch (err) {
      console.error(err);
      this.snackBar.open('❌ Error al enviar el correo', 'Cerrar', { duration: 4000 });
    }
  }
}
