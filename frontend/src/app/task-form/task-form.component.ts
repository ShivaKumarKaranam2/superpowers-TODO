import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTaskRequest, Priority, Task, UpdateTaskRequest } from '../models/models';

export function findClientSideOverlap(
  candidateStart: string,
  candidateEnd: string,
  excludeTaskId: number | null,
  tasks: Task[],
): Task | null {
  const start = new Date(candidateStart).getTime();
  const end = new Date(candidateEnd).getTime();
  for (const task of tasks) {
    if (excludeTaskId !== null && task.id === excludeTaskId) continue;
    if (!task.startTime || !task.endTime) continue;
    const existingStart = new Date(task.startTime).getTime();
    const existingEnd = new Date(task.endTime).getTime();
    if (existingStart < end && start < existingEnd) {
      return task;
    }
  }
  return null;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="submit()">
      <input [(ngModel)]="title" name="title" placeholder="Title" />
      <textarea [(ngModel)]="description" name="description" placeholder="Description"></textarea>
      <select [(ngModel)]="priority" name="priority">
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>
      <input [(ngModel)]="tagsText" name="tags" placeholder="Tags (comma-separated)" />
      <input [(ngModel)]="startTime" name="startTime" type="datetime-local" />
      <input [(ngModel)]="endTime" name="endTime" type="datetime-local" />
      <div class="error" *ngFor="let err of errors">{{ err }}</div>
      <div class="conflict" *ngIf="conflict">Overlaps with "{{ conflict.title }}"</div>
      <button type="submit">Save</button>
      <button type="button" (click)="cancel.emit()">Cancel</button>
    </form>
  `,
})
export class TaskFormComponent {
  @Input({ required: true }) columnId!: number;
  @Input() editingTask: Task | null = null;
  @Input() existingTasks: Task[] = [];
  @Output() save = new EventEmitter<{ request: CreateTaskRequest | UpdateTaskRequest; taskId: number | null }>();
  @Output() cancel = new EventEmitter<void>();

  title = '';
  description = '';
  priority: Priority = 'MEDIUM';
  tagsText = '';
  startTime = '';
  endTime = '';
  errors: string[] = [];
  conflict: Task | null = null;

  ngOnChanges(): void {
    if (this.editingTask) {
      this.title = this.editingTask.title;
      this.description = this.editingTask.description ?? '';
      this.priority = this.editingTask.priority;
      this.tagsText = this.editingTask.tags.join(', ');
      this.startTime = this.toDatetimeLocalValue(this.editingTask.startTime);
      this.endTime = this.toDatetimeLocalValue(this.editingTask.endTime);
    }
  }

  // Converts an ISO instant ("...Z") from the API into the "YYYY-MM-DDTHH:mm" format
  // that <input type="datetime-local"> requires for its value attribute.
  private toDatetimeLocalValue(isoInstant: string | null): string {
    if (!isoInstant) return '';
    const date = new Date(isoInstant);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.title.trim()) {
      errors.push('Title is required');
    }
    const hasStart = !!this.startTime;
    const hasEnd = !!this.endTime;
    if (hasStart !== hasEnd) {
      errors.push('Start time and end time must both be set or both be empty');
    } else if (hasStart && hasEnd && new Date(this.startTime) >= new Date(this.endTime)) {
      errors.push('End time must be after start time');
    }
    return errors;
  }

  submit(): void {
    this.errors = this.validate();
    this.conflict = null;
    if (this.errors.length > 0) {
      return;
    }

    if (this.startTime && this.endTime) {
      this.conflict = findClientSideOverlap(
        this.startTime, this.endTime, this.editingTask?.id ?? null, this.existingTasks,
      );
      if (this.conflict) {
        return;
      }
    }

    const tags = this.tagsText.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
    // datetime-local inputs yield "2026-09-05T09:00" with no timezone; the backend
    // deserializes startTime/endTime as java.time.Instant, which requires an offset/"Z".
    const startTime = this.startTime ? new Date(this.startTime).toISOString() : undefined;
    const endTime = this.endTime ? new Date(this.endTime).toISOString() : undefined;

    if (this.editingTask) {
      const request: UpdateTaskRequest = {
        title: this.title, description: this.description || null, priority: this.priority,
        tags, startTime: startTime ?? null, endTime: endTime ?? null,
      };
      this.save.emit({ request, taskId: this.editingTask.id });
    } else {
      const request: CreateTaskRequest = {
        columnId: this.columnId, title: this.title, description: this.description || undefined,
        priority: this.priority, tags, startTime, endTime,
      };
      this.save.emit({ request, taskId: null });
    }
  }
}
