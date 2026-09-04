import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { BoardComponent } from './board.component';
import { BoardService } from '../services/board.service';
import { Board } from '../models/models';
import { ColumnComponent } from '../column/column.component';

describe('BoardComponent', () => {
  let fixture: ComponentFixture<BoardComponent>;
  const mockBoard: Board = {
    columns: [
      {
        id: 1, name: 'Backlog', position: 0, createdAt: '',
        tasks: [{
          id: 10, columnId: 1, position: 0, title: 'Write spec', description: null,
          priority: 'HIGH', tags: ['docs'], startTime: null, endTime: null,
          createdAt: '', updatedAt: '',
        }],
      },
    ],
  };

  beforeEach(async () => {
    const boardServiceStub = { getBoard: () => of(mockBoard) };
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [{ provide: BoardService, useValue: boardServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
  });

  it('renders the fetched column and task', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Backlog');
    expect(text).toContain('Write spec');
  });
});

describe('BoardComponent column actions', () => {
  let fixture: ComponentFixture<BoardComponent>;
  let createColumnSpy: jasmine.Spy;

  beforeEach(async () => {
    createColumnSpy = jasmine.createSpy('createColumn').and.returnValue(
      of({ id: 2, name: 'New Column', position: 1, createdAt: '' }),
    );
    const boardServiceStub = {
      getBoard: () => of({ columns: [] } as Board),
      createColumn: createColumnSpy,
    };
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [{ provide: BoardService, useValue: boardServiceStub }],
    }).compileComponents();
    fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
  });

  it('adds a column returned from the service to local state', () => {
    fixture.componentInstance.addColumn('New Column');
    expect(createColumnSpy).toHaveBeenCalledWith('New Column');
    expect(fixture.componentInstance.board?.columns.length).toBe(1);
    expect(fixture.componentInstance.board?.columns[0].name).toBe('New Column');
  });
});

describe('BoardComponent task creation', () => {
  let fixture: ComponentFixture<BoardComponent>;
  let createTaskSpy: jasmine.Spy;
  const seededBoard: Board = {
    columns: [{ id: 1, name: 'Backlog', position: 0, createdAt: '', tasks: [] }],
  };

  beforeEach(async () => {
    createTaskSpy = jasmine.createSpy('createTask').and.returnValue(of({
      id: 99, columnId: 1, position: 0, title: 'New task', description: null,
      priority: 'MEDIUM', tags: [], startTime: null, endTime: null, createdAt: '', updatedAt: '',
    }));
    const boardServiceStub = { getBoard: () => of(seededBoard), createTask: createTaskSpy };
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [{ provide: BoardService, useValue: boardServiceStub }],
    }).compileComponents();
    fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
  });

  it('appends a newly created task to its column', () => {
    fixture.componentInstance.onTaskSaved({
      request: { columnId: 1, title: 'New task' }, taskId: null,
    } as any);
    expect(createTaskSpy).toHaveBeenCalled();
    expect(fixture.componentInstance.board?.columns[0].tasks.length).toBe(1);
    expect(fixture.componentInstance.board?.columns[0].tasks[0].title).toBe('New task');
  });
});

describe('BoardComponent drag-and-drop', () => {
  let fixture: ComponentFixture<BoardComponent>;
  let moveTaskSpy: jasmine.Spy;
  const taskA = {
    id: 1, columnId: 1, position: 0, title: 'A', description: null,
    priority: 'MEDIUM' as const, tags: [], startTime: null, endTime: null, createdAt: '', updatedAt: '',
  };
  const seededBoard: Board = {
    columns: [
      { id: 1, name: 'Backlog', position: 0, createdAt: '', tasks: [taskA] },
      { id: 2, name: 'Done', position: 1, createdAt: '', tasks: [] },
    ],
  };

  beforeEach(async () => {
    moveTaskSpy = jasmine.createSpy('moveTask').and.returnValue(of(taskA));
    const boardServiceStub = { getBoard: () => of(seededBoard), moveTask: moveTaskSpy };
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [{ provide: BoardService, useValue: boardServiceStub }],
    }).compileComponents();
    fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
  });

  it('optimistically moves a task between columns and calls the API', () => {
    fixture.componentInstance.onTaskDropped(1, 1, 2, 0);

    expect(fixture.componentInstance.board?.columns[0].tasks.length).toBe(0);
    expect(fixture.componentInstance.board?.columns[1].tasks.length).toBe(1);
    expect(moveTaskSpy).toHaveBeenCalledWith(1, { targetColumnId: 2, targetPosition: 0 });
  });
});

describe('BoardComponent edit wiring', () => {
  let fixture: ComponentFixture<BoardComponent>;
  const taskA = {
    id: 1, columnId: 1, position: 0, title: 'A', description: null,
    priority: 'MEDIUM' as const, tags: [], startTime: null, endTime: null, createdAt: '', updatedAt: '',
  };
  const seededBoard: Board = {
    columns: [{ id: 1, name: 'Backlog', position: 0, createdAt: '', tasks: [taskA] }],
  };

  beforeEach(async () => {
    const boardServiceStub = { getBoard: () => of(seededBoard) };
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [{ provide: BoardService, useValue: boardServiceStub }],
    }).compileComponents();
    fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
  });

  it('sets editingTask when a column emits editTask, and clears it on cancel', () => {
    expect(fixture.componentInstance.editingTask).toBeNull();

    fixture.componentInstance.onEditTask(taskA);
    fixture.detectChanges();
    expect(fixture.componentInstance.editingTask).toBe(taskA);

    const taskFormEl = fixture.nativeElement.querySelector('app-task-form');
    expect(taskFormEl).not.toBeNull();

    fixture.componentInstance.activeColumnIdForNewTask = null;
    fixture.componentInstance.editingTask = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-task-form')).toBeNull();
  });

  it('emits editTask from ColumnComponent up through the task card edit click', () => {
    fixture.detectChanges();
    const columnDebugEl = fixture.debugElement.query(By.directive(ColumnComponent));
    expect(columnDebugEl).not.toBeNull();
    (columnDebugEl!.componentInstance as ColumnComponent).editTask.emit(taskA);
    expect(fixture.componentInstance.editingTask).toBe(taskA);
  });

  it('opens the create-task form for a column when addTask is emitted, clearing any in-progress edit', () => {
    fixture.componentInstance.editingTask = taskA;

    fixture.componentInstance.onAddTaskClicked(1);

    expect(fixture.componentInstance.activeColumnIdForNewTask).toBe(1);
    expect(fixture.componentInstance.editingTask).toBeNull();
  });

  it('wires the column addTask output to onAddTaskClicked', () => {
    fixture.detectChanges();
    const columnDebugEl = fixture.debugElement.query(By.directive(ColumnComponent));
    expect(columnDebugEl).not.toBeNull();
    (columnDebugEl!.componentInstance as ColumnComponent).addTask.emit(1);
    expect(fixture.componentInstance.activeColumnIdForNewTask).toBe(1);
  });
});
