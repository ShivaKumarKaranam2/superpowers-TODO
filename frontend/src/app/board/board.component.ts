import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../services/board.service';
import { Board } from '../models/models';
import { ColumnComponent } from '../column/column.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, ColumnComponent],
  template: `
    <div class="board">
      <app-column *ngFor="let column of board?.columns" [column]="column"
                   (rename)="onRenameColumn($event)" (delete)="onDeleteColumn($event)"></app-column>
      <input #newColumnName placeholder="New column name" (keyup.enter)="addColumn(newColumnName.value); newColumnName.value = ''" />
    </div>
  `,
})
export class BoardComponent implements OnInit {
  board: Board | null = null;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.getBoard().subscribe((board) => (this.board = board));
  }

  addColumn(name: string): void {
    this.boardService.createColumn(name).subscribe((column) => {
      if (this.board) {
        this.board.columns.push({ ...column, tasks: [] });
      }
    });
  }

  onRenameColumn(event: { id: number; name: string }): void {
    this.boardService.updateColumn(event.id, { name: event.name }).subscribe(() => {
      const column = this.board?.columns.find((c) => c.id === event.id);
      if (column) {
        column.name = event.name;
      }
    });
  }

  onDeleteColumn(id: number): void {
    this.boardService.deleteColumn(id).subscribe(() => {
      if (this.board) {
        this.board.columns = this.board.columns.filter((c) => c.id !== id);
      }
    });
  }
}
