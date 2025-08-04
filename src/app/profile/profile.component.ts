import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { authState, Auth, User } from '@angular/fire/auth';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { filter, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar'; // Importamos MatSnackBar
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  private uid = '';

  // Variables para controlar la edición
  editingName  = false;
  editingPhone = false;

  // Guardamos los valores originales para verificar si hubo cambios
  originalValues: { name: string, phone: string } = { name: '', phone: '' };

  constructor(
    private fb: FormBuilder,
    private afAuth: Auth,
    private afs: Firestore,
    private snackBar: MatSnackBar // Inyectamos MatSnackBar
  ) {
    this.form = this.fb.group({
      name:  [{ value: '', disabled: true }, Validators.required],
      phone: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, Validators.required],
      role:  [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    authState(this.afAuth).pipe(
      filter((u): u is User => u != null),
      take(1)
    ).subscribe(user => {
      this.uid = user.uid;
      this.form.get('email')!.setValue(user.email ?? '');
      const ref = doc(this.afs, 'users', this.uid);
      docData<{ name?: string; phone?: string; role?: string }>(ref).pipe(take(1))
        .subscribe(data => {
          this.form.patchValue({
            name:  data?.name  ?? '',
            phone: data?.phone ?? '',
            role:  data?.role  ?? ''
          });
          // Guardamos los valores originales para comparación
          this.originalValues = {
            name: data?.name ?? '',
            phone: data?.phone ?? ''
          };
        });
    });
  }

  toggleEditName(): void {
    const ctrl = this.form.get('name')!;
    if (this.editingName) {
      this.saveField('name', ctrl.value);
      ctrl.disable({ emitEvent: false });
    } else {
      ctrl.enable({ emitEvent: false });
    }
    this.editingName = !this.editingName;
  }

  toggleEditPhone(): void {
    const ctrl = this.form.get('phone')!;
    if (this.editingPhone) {
      this.saveField('phone', ctrl.value);
      ctrl.disable({ emitEvent: false });
    } else {
      ctrl.enable({ emitEvent: false });
    }
    this.editingPhone = !this.editingPhone;
  }

  private saveField(field: 'name' | 'phone', value: string): void {
    if (!this.uid) return;
    const ref = doc(this.afs, 'users', this.uid);
    updateDoc(ref, { [field]: value });
  }

  saveAll(): void {
    if (this.form.invalid || !this.uid) return;

    // Verificamos si hubo cambios
    const currentValues = {
      name: this.form.get('name')!.value,
      phone: this.form.get('phone')!.value
    };

    // Si no hay cambios, mostramos una alerta
    if (currentValues.name === this.originalValues.name && currentValues.phone === this.originalValues.phone) {
      this.snackBar.open('No se han realizado cambios', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Si hay cambios, guardamos
    const ref = doc(this.afs, 'users', this.uid);
    updateDoc(ref, {
      name:  this.form.get('name')!.value,
      phone: this.form.get('phone')!.value
    }).then(() => {
      // Deshabilitamos los campos y restablecemos flags
      this.form.get('name')!.disable({ emitEvent: false });
      this.form.get('phone')!.disable({ emitEvent: false });
      this.editingName  = false;
      this.editingPhone = false;

      // Alerta de éxito
      this.snackBar.open('Cambios guardados exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Actualizamos los valores originales
      this.originalValues = { name: currentValues.name, phone: currentValues.phone };
    });
  }
}
