import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noteFilter',
  standalone: true
})
export class NoteFilterPipe implements PipeTransform {
  transform(notes: any[], filter: string): any[] {
    if (!notes) return [];
    if (filter === 'all') return notes;
    return notes.filter(note => note.status === filter);
  }
}
