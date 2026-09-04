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
}
