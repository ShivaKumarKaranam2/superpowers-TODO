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
      <app-column *ngFor="let column of board?.columns" [column]="column"></app-column>
    </div>
  `,
})
export class BoardComponent implements OnInit {
  board: Board | null = null;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.getBoard().subscribe((board) => (this.board = board));
  }
}
