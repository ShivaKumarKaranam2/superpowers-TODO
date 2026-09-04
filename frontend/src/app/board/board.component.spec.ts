import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BoardComponent } from './board.component';
import { BoardService } from '../services/board.service';
import { Board } from '../models/models';

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
