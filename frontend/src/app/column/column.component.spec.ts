import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnComponent } from './column.component';
import { ColumnWithTasks } from '../models/models';

describe('ColumnComponent', () => {
  let fixture: ComponentFixture<ColumnComponent>;
  const column: ColumnWithTasks = { id: 1, name: 'Backlog', position: 0, createdAt: '', tasks: [] };

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
});
