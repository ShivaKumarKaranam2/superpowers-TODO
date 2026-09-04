package com.todoapp.backend.column;

import com.todoapp.backend.column.dto.ColumnResponse;
import com.todoapp.backend.column.dto.CreateColumnRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/columns")
public class WorkflowColumnController {

    private final WorkflowColumnService service;

    public WorkflowColumnController(WorkflowColumnService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ColumnResponse> create(@Valid @RequestBody CreateColumnRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request.getName()));
    }

    @GetMapping
    public List<ColumnResponse> listAll() {
        return service.listAll();
    }
}
