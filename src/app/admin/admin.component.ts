import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MaterialModule } from '../shared/material.module';
// Importar módulos de Angular Material necesarios
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

interface User {
  uid: string;
  email: string;
  role: 'user' | 'admin';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    MatTableModule,
    MatButtonModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  users$: Observable<User[]>;
  displayedColumns = ['email', 'role', 'actions'];

  constructor(private afs: Firestore) {
    const usersCol = collection(this.afs, 'users');
    this.users$ = collectionData(usersCol, { idField: 'uid' }) as Observable<User[]>;
  }

  toggleRole(user: User) {
    const ref = doc(this.afs, 'users', user.uid);
    const newRole: 'user' | 'admin' = user.role === 'admin' ? 'user' : 'admin';
    updateDoc(ref, { role: newRole });
    user.role = newRole; // Actualiza optimistamente en la UI
  }
}