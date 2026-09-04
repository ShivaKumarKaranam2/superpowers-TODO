import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnWithTasks } from '../models/models';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent],
  template: `
    <div class="column">
      <div *ngIf="!renaming" (dblclick)="startRenaming()">
        <h3>{{ column.name }}</h3>
      </div>
      <input *ngIf="renaming" [(ngModel)]="renameDraft" (blur)="confirmRename()" (keyup.enter)="confirmRename()" />
      <button type="button" (click)="requestDelete()">Delete column</button>
      <app-task-card *ngFor="let task of column.tasks" [task]="task"></app-task-card>
    </div>
  `,
})
export class ColumnComponent {
  @Input({ required: true }) column!: ColumnWithTasks;
  @Output() rename = new EventEmitter<{ id: number; name: string }>();
  @Output() delete = new EventEmitter<number>();

  renaming = false;
  renameDraft = '';

  startRenaming(): void {
    this.renaming = true;
    this.renameDraft = this.column.name;
  }

  confirmRename(): void {
    if (this.renaming) {
      this.renaming = false;
      this.rename.emit({ id: this.column.id, name: this.renameDraft });
    }
  }

  requestDelete(): void {
    this.delete.emit(this.column.id);
  }
}
