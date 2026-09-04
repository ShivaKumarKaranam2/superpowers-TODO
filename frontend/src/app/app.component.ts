import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './board/board.component';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BoardComponent],
  template: `
    <div class="toast" *ngIf="toastService.message()">{{ toastService.message() }}</div>
    <app-board></app-board>
  `,
  styles: [`
    .toast { position: fixed; top: 16px; right: 16px; background: #333; color: white; padding: 10px 16px; border-radius: 6px; z-index: 1000; }
  `],
})
export class AppComponent {
  title = 'frontend';
  protected readonly toastService = inject(ToastService);
}
