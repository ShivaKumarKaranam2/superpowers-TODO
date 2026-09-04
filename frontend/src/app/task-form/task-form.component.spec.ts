import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent, findClientSideOverlap } from './task-form.component';
import { Task } from '../models/models';

describe('findClientSideOverlap', () => {
  const scheduled: Task = {
    id: 1, columnId: 1, position: 0, title: 'Standup', description: null,
    priority: 'MEDIUM', tags: [], startTime: '2026-09-05T09:00:00Z', endTime: '2026-09-05T10:00:00Z',
    createdAt: '', updatedAt: '',
  };

  it('detects a partial overlap', () => {
    const result = findClientSideOverlap('2026-09-05T09:30:00Z', '2026-09-05T11:00:00Z', null, [scheduled]);
    expect(result?.id).toBe(1);
  });

  it('allows back-to-back schedules', () => {
    const result = findClientSideOverlap('2026-09-05T10:00:00Z', '2026-09-05T11:00:00Z', null, [scheduled]);
    expect(result).toBeNull();
  });

  it('excludes the task being edited from its own overlap check', () => {
    const result = findClientSideOverlap('2026-09-05T09:00:00Z', '2026-09-05T10:00:00Z', 1, [scheduled]);
    expect(result).toBeNull();
  });
});

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TaskFormComponent] }).compileComponents();
    fixture = TestBed.createComponent(TaskFormComponent);
    fixture.componentInstance.columnId = 1;
    fixture.componentInstance.editingTask = null;
    fixture.componentInstance.existingTasks = [];
    fixture.detectChanges();
  });

  it('rejects submission with a blank title', () => {
    fixture.componentInstance.title = '';
    expect(fixture.componentInstance.validate()).toContain('Title is required');
  });

  it('rejects an end time that is not after the start time', () => {
    fixture.componentInstance.title = 'Task';
    fixture.componentInstance.startTime = '2026-09-05T10:00:00';
    fixture.componentInstance.endTime = '2026-09-05T09:00:00';
    expect(fixture.componentInstance.validate()).toContain('End time must be after start time');
  });

  it('emits save with a well-formed CreateTaskRequest when valid', () => {
    const emitted: any[] = [];
    fixture.componentInstance.save.subscribe((e: any) => emitted.push(e));
    fixture.componentInstance.title = 'New task';
    fixture.componentInstance.submit();
    expect(emitted[0].request.title).toBe('New task');
    expect(emitted[0].request.columnId).toBe(1);
  });
});
