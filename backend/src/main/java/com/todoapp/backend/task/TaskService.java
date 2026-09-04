package com.todoapp.backend.task;

import com.todoapp.backend.column.WorkflowColumn;
import com.todoapp.backend.column.WorkflowColumnRepository;
import com.todoapp.backend.common.exception.NotFoundException;
import com.todoapp.backend.common.exception.ValidationException;
import com.todoapp.backend.task.dto.CreateTaskRequest;
import com.todoapp.backend.task.dto.TaskResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final WorkflowColumnRepository columnRepository;

    public TaskService(TaskRepository taskRepository, WorkflowColumnRepository columnRepository) {
        this.taskRepository = taskRepository;
        this.columnRepository = columnRepository;
    }

    public TaskResponse create(CreateTaskRequest request) {
        WorkflowColumn column = columnRepository.findById(request.getColumnId())
                .orElseThrow(() -> new NotFoundException("Column " + request.getColumnId() + " not found"));

        validateSchedulePairing(request.getStartTime(), request.getEndTime());
        findOverlapping(request.getStartTime(), request.getEndTime(), null)
                .ifPresent(conflict -> { throw new com.todoapp.backend.common.exception.OverlapException(conflict); });

        int nextPosition = (int) taskRepository.countByColumnId(column.getId());
        Task task = new Task(column, nextPosition, request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getTags() != null) {
            task.setTags(new HashSet<>(request.getTags()));
        }
        task.setStartTime(request.getStartTime());
        task.setEndTime(request.getEndTime());

        return new TaskResponse(taskRepository.save(task));
    }

    private void validateSchedulePairing(Instant startTime, Instant endTime) {
        if ((startTime == null) != (endTime == null)) {
            throw new ValidationException("startTime and endTime must both be set or both be null",
                    Map.of("startTime", "must be set together with endTime"));
        }
        if (startTime != null && !startTime.isBefore(endTime)) {
            throw new ValidationException("endTime must be after startTime",
                    Map.of("endTime", "must be strictly after startTime"));
        }
    }

    public TaskResponse update(Long id, com.todoapp.backend.task.dto.UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task " + id + " not found"));

        validateSchedulePairing(request.getStartTime(), request.getEndTime());
        findOverlapping(request.getStartTime(), request.getEndTime(), task.getId())
                .ifPresent(conflict -> { throw new com.todoapp.backend.common.exception.OverlapException(conflict); });

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setTags(new HashSet<>(request.getTags()));
        task.setStartTime(request.getStartTime());
        task.setEndTime(request.getEndTime());
        task.touchUpdatedAt();

        return new TaskResponse(taskRepository.save(task));
    }

    Optional<Task> findOverlapping(Instant startTime, Instant endTime, Long excludeTaskId) {
        if (startTime == null || endTime == null) {
            return Optional.empty();
        }
        return taskRepository.findByStartTimeIsNotNullAndEndTimeIsNotNull().stream()
                .filter(existing -> !existing.getId().equals(excludeTaskId))
                .filter(existing -> existing.getStartTime().isBefore(endTime)
                        && startTime.isBefore(existing.getEndTime()))
                .findFirst();
    }
}
