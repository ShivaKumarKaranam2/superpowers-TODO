package com.todoapp.backend.column;

import com.todoapp.backend.column.dto.ColumnResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkflowColumnService {

    private final WorkflowColumnRepository repository;

    public WorkflowColumnService(WorkflowColumnRepository repository) {
        this.repository = repository;
    }

    public ColumnResponse create(String name) {
        int nextPosition = repository.findAllByOrderByPositionAsc().size();
        WorkflowColumn saved = repository.save(new WorkflowColumn(name, nextPosition));
        return new ColumnResponse(saved);
    }

    public List<ColumnResponse> listAll() {
        return repository.findAllByOrderByPositionAsc().stream()
                .map(ColumnResponse::new)
                .toList();
    }

    public ColumnResponse update(Long id, String name, Integer position) {
        WorkflowColumn column = repository.findById(id)
                .orElseThrow(() -> new com.todoapp.backend.common.exception.NotFoundException(
                        "Column " + id + " not found"));

        if (name != null) {
            column.setName(name);
        }
        if (position != null) {
            reposition(column, position);
        }
        return new ColumnResponse(repository.save(column));
    }

    private void reposition(WorkflowColumn moved, int targetPosition) {
        List<WorkflowColumn> ordered = repository.findAllByOrderByPositionAsc();
        ordered.removeIf(c -> c.getId().equals(moved.getId()));
        int insertAt = Math.max(0, Math.min(targetPosition, ordered.size()));
        ordered.add(insertAt, moved);
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setPosition(i);
        }
        repository.saveAll(ordered);
    }

    public void delete(Long id) {
        WorkflowColumn column = repository.findById(id)
                .orElseThrow(() -> new com.todoapp.backend.common.exception.NotFoundException(
                        "Column " + id + " not found"));
        if (hasAnyTasks(id)) {
            throw new com.todoapp.backend.common.exception.ValidationException(
                    "Column is not empty", java.util.Map.of("id", "column has tasks and cannot be deleted"));
        }
        repository.delete(column);
    }

    // Always false until Task 6 rewires this to query TaskRepository once Task entity exists.
    private boolean hasAnyTasks(Long columnId) {
        return false;
    }
}
