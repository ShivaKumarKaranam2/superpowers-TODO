import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { BoardService } from '../services/board.service';
import { Board, CreateTaskRequest, Task, UpdateTaskRequest } from '../models/models';
import { ColumnComponent } from '../column/column.component';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, ColumnComponent, TaskFormComponent],
  template: `
    <div class="board" cdkDropListGroup>
      <app-column *ngFor="let column of board?.columns" [column]="column"
                   (rename)="onRenameColumn($event)" (delete)="onDeleteColumn($event)"
                   (drop)="onColumnDropEvent($event)" (editTask)="onEditTask($event)"
                   (addTask)="onAddTaskClicked($event)"></app-column>
      <input #newColumnName placeholder="New column name" (keyup.enter)="addColumn(newColumnName.value); newColumnName.value = ''" />
      <app-task-form *ngIf="activeColumnIdForNewTask !== null || editingTask !== null"
                      [columnId]="(editingTask?.columnId ?? activeColumnIdForNewTask)!"
                      [editingTask]="editingTask"
                      [existingTasks]="allTasks()" [serverConflict]="lastConflict" (save)="onTaskSaved($event)"
                      (cancel)="onCancelForm()"></app-task-form>
    </div>
  `,
})
export class BoardComponent implements OnInit {
  board: Board | null = null;
  activeColumnIdForNewTask: number | null = null;
  editingTask: Task | null = null;
  lastConflict: { id: number; title: string; startTime: string; endTime: string } | null = null;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.getBoard().subscribe((board) => (this.board = board));
  }

  allTasks(): Task[] {
    return this.board?.columns.flatMap((c) => c.tasks) ?? [];
  }

  addColumn(name: string): void {
    this.boardService.createColumn(name).subscribe((column) => {
      this.board?.columns.push({ ...column, tasks: [] });
    });
  }

  onRenameColumn(event: { id: number; name: string }): void {
    this.boardService.updateColumn(event.id, { name: event.name }).subscribe(() => {
      const column = this.board?.columns.find((c) => c.id === event.id);
      if (column) column.name = event.name;
    });
  }

  onDeleteColumn(id: number): void {
    this.boardService.deleteColumn(id).subscribe(() => {
      if (this.board) this.board.columns = this.board.columns.filter((c) => c.id !== id);
    });
  }

  onEditTask(task: Task): void {
    this.editingTask = task;
    this.lastConflict = null;
  }

  onAddTaskClicked(columnId: number): void {
    this.activeColumnIdForNewTask = columnId;
    this.editingTask = null;
    this.lastConflict = null;
  }

  onCancelForm(): void {
    this.activeColumnIdForNewTask = null;
    this.editingTask = null;
    this.lastConflict = null;
  }

  onTaskSaved(event: { request: CreateTaskRequest | UpdateTaskRequest; taskId: number | null }): void {
    const handleError = (err: any) => {
      if (err.status === 409) {
        this.lastConflict = err.error.conflictingTask;
      }
    };
    if (event.taskId === null) {
      this.boardService.createTask(event.request as CreateTaskRequest).subscribe({
        next: (task) => {
          const column = this.board?.columns.find((c) => c.id === task.columnId);
          column?.tasks.push(task);
          this.activeColumnIdForNewTask = null;
          this.editingTask = null;
        },
        error: handleError,
      });
    } else {
      this.boardService.updateTask(event.taskId, event.request as UpdateTaskRequest).subscribe({
        next: (task) => {
          const column = this.board?.columns.find((c) => c.id === task.columnId);
          const index = column?.tasks.findIndex((t) => t.id === task.id) ?? -1;
          if (column && index >= 0) column.tasks[index] = task;
          this.editingTask = null;
        },
        error: handleError,
      });
    }
  }

  onColumnDropEvent(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    const targetColumnId = Number((event.container.id as string).replace('column-', ''));
    this.onTaskDropped(task.id, task.columnId, targetColumnId, event.currentIndex);
  }

  onTaskDropped(taskId: number, sourceColumnId: number, targetColumnId: number, targetIndex: number): void {
    if (!this.board) return;
    const sourceColumn = this.board.columns.find((c) => c.id === sourceColumnId);
    const targetColumn = this.board.columns.find((c) => c.id === targetColumnId);
    if (!sourceColumn || !targetColumn) return;

    const taskIndex = sourceColumn.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;
    const [task] = sourceColumn.tasks.splice(taskIndex, 1);
    task.columnId = targetColumnId;
    targetColumn.tasks.splice(targetIndex, 0, task);

    this.boardService.moveTask(taskId, { targetColumnId, targetPosition: targetIndex }).subscribe({
      error: () => {
        targetColumn.tasks.splice(targetColumn.tasks.indexOf(task), 1);
        task.columnId = sourceColumnId;
        sourceColumn.tasks.splice(taskIndex, 0, task);
      },
    });
  }
}
