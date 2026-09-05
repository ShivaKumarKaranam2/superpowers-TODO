import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnComponent } from './column.component';
import { ColumnWithTasks } from '../models/models';

describe('ColumnComponent', () => {
  let fixture: ComponentFixture<ColumnComponent>;
  const column: ColumnWithTasks = { id: 1, name: 'Backlog', position: 0, createdAt: '', tasks: [] };
  const columnWithTask: ColumnWithTasks = {
    id: 1, name: 'Backlog', position: 0, createdAt: '',
    tasks: [{
      id: 10, columnId: 1, position: 0, title: 'Write spec', description: null,
      priority: 'HIGH', tags: [], startTime: null, endTime: null, createdAt: '', updatedAt: '',
    }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ColumnComponent] }).compileComponents();
    fixture = TestBed.createComponent(ColumnComponent);
    fixture.componentInstance.column = column;
    fixture.detectChanges();
  });

  it('emits rename with the new name', () => {
    const emitted: { id: number; name: string }[] = [];
    fixture.componentInstance.rename.subscribe((e: any) => emitted.push(e));

    fixture.componentInstance.startRenaming();
    fixture.componentInstance.renameDraft = 'Todo';
    fixture.componentInstance.confirmRename();

    expect(emitted).toEqual([{ id: 1, name: 'Todo' }]);
  });

  it('emits delete with the column id', () => {
    const emitted: number[] = [];
    fixture.componentInstance.delete.subscribe((id: number) => emitted.push(id));

    fixture.componentInstance.requestDelete();

    expect(emitted).toEqual([1]);
  });

  it('emits addTask with the column id when the add-task button is clicked', () => {
    const emitted: number[] = [];
    fixture.componentInstance.addTask.subscribe((id: number) => emitted.push(id));

    const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('button');
    const addTaskButton = Array.from(buttons).find((b) => b.textContent?.includes('Add task'));
    expect(addTaskButton).toBeDefined();
    addTaskButton!.click();

    expect(emitted).toEqual([1]);
  });

  it('forwards a task card\'s edit click to editTask, end-to-end through the real DOM', () => {
    fixture.componentInstance.column = columnWithTask;
    fixture.detectChanges();

    const emitted: any[] = [];
    fixture.componentInstance.editTask.subscribe((task: any) => emitted.push(task));

    const editButton: HTMLButtonElement = fixture.nativeElement.querySelector('.edit-btn');
    expect(editButton).not.toBeNull();
    editButton.click();

    expect(emitted.length).toBe(1);
    expect(emitted[0].id).toBe(10);
  });
});
