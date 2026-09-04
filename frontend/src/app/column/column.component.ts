import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ColumnWithTasks, Task } from '../models/models';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TaskCardComponent],
  template: `
    <div class="column">
      <div *ngIf="!renaming" (dblclick)="startRenaming()"><h3>{{ column.name }}</h3></div>
      <input *ngIf="renaming" [(ngModel)]="renameDraft" (blur)="confirmRename()" (keyup.enter)="confirmRename()" />
      <button type="button" (click)="requestDelete()">Delete column</button>
      <button type="button" (click)="addTask.emit(column.id)">+ Add task</button>
      <div cdkDropList [id]="'column-' + column.id" [cdkDropListData]="column.tasks"
           (cdkDropListDropped)="drop.emit($event)" class="task-list">
        <app-task-card *ngFor="let task of column.tasks" cdkDrag [cdkDragData]="task" [task]="task"
                       (edit)="editTask.emit($event)"></app-task-card>
      </div>
    </div>
  `,
  styles: [`
    .column { min-width: 260px; max-width: 260px; background: #f4f5f7; padding: 12px; border-radius: 8px; }
    .task-list { min-height: 40px; }
  `],
})
export class ColumnComponent {
  @Input({ required: true }) column!: ColumnWithTasks;
  @Output() rename = new EventEmitter<{ id: number; name: string }>();
  @Output() delete = new EventEmitter<number>();
  @Output() drop = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() addTask = new EventEmitter<number>();

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
