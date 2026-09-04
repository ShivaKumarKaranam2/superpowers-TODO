import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../models/models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-card">
      <div class="task-title">
        {{ task.title }}
        <button type="button" class="edit-btn" (click)="edit.emit(task)">Edit</button>
      </div>
      <span class="priority-badge" [class]="'priority-' + task.priority.toLowerCase()">{{ task.priority }}</span>
      <div class="tags">
        <span class="tag" *ngFor="let tag of task.tags">{{ tag }}</span>
      </div>
      <div class="schedule" *ngIf="task.startTime && task.endTime">
        {{ task.startTime | date:'short' }} – {{ task.endTime | date:'short' }}
      </div>
    </div>
  `,
  styles: [`
    .task-card { padding: 10px; background: white; border-radius: 6px; margin-bottom: 8px; cursor: grab; box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
    .task-title { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-weight: 600; }
    .edit-btn { font-size: 0.75em; cursor: pointer; }
    .priority-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75em; display: inline-block; margin-top: 4px; }
    .priority-low { background: #d4edda; color: #155724; }
    .priority-medium { background: #fff3cd; color: #856404; }
    .priority-high { background: #f8d7da; color: #721c24; }
    .priority-urgent { background: #dc3545; color: white; }
  `],
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() edit = new EventEmitter<Task>();
}
