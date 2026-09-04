import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnWithTasks } from '../models/models';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  template: `
    <div class="column">
      <h3>{{ column.name }}</h3>
      <app-task-card *ngFor="let task of column.tasks" [task]="task"></app-task-card>
    </div>
  `,
})
export class ColumnComponent {
  @Input({ required: true }) column!: ColumnWithTasks;
}
