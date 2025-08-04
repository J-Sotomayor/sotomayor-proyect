import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, EMPTY } from 'rxjs';
import { User } from '@angular/fire/auth';
import { NoteFilterPipe } from '../shared/note-filter.pipe';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonToggleModule,
    NoteFilterPipe
  ],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
  private firestore = inject(Firestore);

  notes$!: Observable<any[]>;
  notes: any[] = [];
  form!: FormGroup;
  editMode = false;
  editNoteId: string | null = null;
  userId: string | null = null;
  filter: string = 'all';
  loading: boolean = true;
  saving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    this.authService.user$.subscribe((user: User | null) => {
      if (user) {
        this.userId = user.uid;

        const notesRef = collection(this.firestore, 'notes');
        const q = query(
          notesRef,
          where('userId', '==', this.userId),
          orderBy('createdAt', 'desc')
        );

        this.notes$ = collectionData(q, { idField: 'id' });
        this.notes$.subscribe({
          next: data => {
            this.notes = data;
            this.loading = false;
          },
          error: err => {
            console.error('❌ Error al cargar notas:', err);
            this.loading = false;
            this.snackBar.open('No se pudieron cargar tus notas', 'Cerrar', { duration: 4000 });
          }
        });

      } else {
        this.notes$ = EMPTY;
        this.notes = [];
        this.loading = false;
      }
    });
  }

  async addOrUpdateNote(): Promise<void> {
    if (this.form.invalid || !this.userId) return;

    this.saving = true;
    const { title, content } = this.form.value;

    try {
      if (this.editMode && this.editNoteId) {
        const noteRef = doc(this.firestore, 'notes', this.editNoteId);
        await updateDoc(noteRef, { title, content });
        this.snackBar.open('✅ Nota actualizada', 'Cerrar', { duration: 3000 });
        this.resetForm();
      } else {
        await addDoc(collection(this.firestore, 'notes'), {
          title,
          content,
          userId: this.userId,
          createdAt: serverTimestamp(),
          status: 'new'
        });
        this.snackBar.open('🎉 Nota agregada', 'Cerrar', { duration: 3000 });
        this.form.reset();
      }
    } catch (e) {
      console.error('❌ Error al guardar nota:', e);
      this.snackBar.open('Error al guardar nota', 'Cerrar', { duration: 3000 });
    } finally {
      this.saving = false;
    }
  }

  editNote(note: any): void {
    if (note.status === 'completed') return;
    this.editMode = true;
    this.editNoteId = note.id;
    this.form.patchValue({
      title: note.title,
      content: note.content
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const noteRef = doc(this.firestore, 'notes', noteId);
      await deleteDoc(noteRef);
      this.snackBar.open('🗑️ Nota eliminada', 'Cerrar', { duration: 3000 });
    } catch (err) {
      console.error('❌ Error al eliminar nota:', err);
      this.snackBar.open('Error al eliminar nota', 'Cerrar', { duration: 3000 });
    }
  }

  async updateStatus(noteId: string, status: string): Promise<void> {
    try {
      const noteRef = doc(this.firestore, 'notes', noteId);
      await updateDoc(noteRef, { status });
      this.snackBar.open(`📌 Estado cambiado a ${status}`, 'Cerrar', { duration: 3000 });
    } catch (err) {
      console.error('❌ Error al cambiar estado:', err);
      this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editMode = false;
    this.editNoteId = null;
    this.form.reset();
  }

  setFilter(status: string) {
    this.filter = status;
  }

  exportToPDF(notes: any[]) {
    const doc = new jsPDF();
    doc.text('Reporte de Notas', 14, 20);

    autoTable(doc, {
      head: [['Título', 'Contenido', 'Estado', 'Fecha']],
      body: notes.map(n => [
        n.title,
        n.content,
        n.status,
        n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : ''
      ])
    });

    doc.save('notas.pdf');
    this.snackBar.open('📄 PDF exportado', 'Cerrar', { duration: 3000 });
  }

  exportToExcel(notes: any[]) {
    const worksheet = XLSX.utils.json_to_sheet(
      notes.map(n => ({
        Título: n.title,
        Contenido: n.content,
        Estado: n.status,
        Fecha: n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : ''
      }))
    );
    const workbook = { Sheets: { 'Notas': worksheet }, SheetNames: ['Notas'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'notas.xlsx');
    this.snackBar.open('📊 Excel exportado', 'Cerrar', { duration: 3000 });
  }
}
