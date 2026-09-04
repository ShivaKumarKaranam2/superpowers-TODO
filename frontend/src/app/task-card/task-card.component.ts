import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../models/models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-card" (click)="edit.emit(task)">
      <div class="task-title">{{ task.title }}</div>
      <span class="priority-badge" [class]="'priority-' + task.priority.toLowerCase()">{{ task.priority }}</span>
      <div class="tags">
        <span class="tag" *ngFor="let tag of task.tags">{{ tag }}</span>
      </div>
      <div class="schedule" *ngIf="task.startTime && task.endTime">
        {{ task.startTime | date:'short' }} – {{ task.endTime | date:'short' }}
      </div>
    </div>
  `,
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() edit = new EventEmitter<Task>();
}
