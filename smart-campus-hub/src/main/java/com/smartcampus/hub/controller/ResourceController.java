package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ResourceDTO;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // GET /api/resources -> retrieve all items
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources(
            @RequestParam(required = false) Resource.ResourceType type,
            @RequestParam(required = false) Resource.ResourceStatus status) {
        return ResponseEntity.ok(resourceService.getAllResources(type, status));
    }

    // GET /api/resources/{id} -> retrieve a specific item by its ID
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/resources -> create a new item
    @PostMapping
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        ResourceDTO createdResource = resourceService.createResource(resourceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdResource);
    }

    // PUT /api/resources/{id} -> update an item
    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceDTO resourceDTO) {
        return ResponseEntity.ok(resourceService.updateResource(id, resourceDTO));
    }

    // DELETE /api/resources/{id} -> delete an item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
