package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceDTO;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public List<ResourceDTO> getAllResources(Resource.ResourceType type, Resource.ResourceStatus status) {
        List<Resource> resources;

        // Simple manual filtering for demonstration.
        // In a real application, use JpaSpecification or QueryDSL for dynamic queries.
        if (type != null && status != null) {
            resources = resourceRepository.findAll().stream()
                    .filter(r -> r.getType() == type && r.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (type != null) {
            resources = resourceRepository.findByType(type);
        } else if (status != null) {
            resources = resourceRepository.findByStatus(status);
        } else {
            resources = resourceRepository.findAll();
        }

        return resources.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        return mapToDTO(resource);
    }

    @Transactional
    public ResourceDTO createResource(ResourceDTO resourceDTO) {
        Resource resource = mapToEntity(resourceDTO);

        // Default new resources to AVAILABLE if neither is provided
        if (resource.getStatus() == null) {
            resource.setStatus(Resource.ResourceStatus.AVAILABLE);
        }

        Resource savedResource = resourceRepository.save(resource);
        return mapToDTO(savedResource);
    }

    @Transactional
    public ResourceDTO updateResource(Long id, ResourceDTO resourceDTO) {
        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        existingResource.setName(resourceDTO.getName());
        existingResource.setType(resourceDTO.getType());
        existingResource.setLocation(resourceDTO.getLocation());
        existingResource.setCapacity(resourceDTO.getCapacity());
        existingResource.setDescription(resourceDTO.getDescription());

        if (resourceDTO.getStatus() != null) {
            existingResource.setStatus(resourceDTO.getStatus());
        }

        Resource updatedResource = resourceRepository.save(existingResource);
        return mapToDTO(updatedResource);
    }

    @Transactional
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with ID: " + id);
        }
        resourceRepository.deleteById(id);
    }

    // Converters (Can also use MapStruct in a larger project)
    private ResourceDTO mapToDTO(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setLocation(resource.getLocation());
        dto.setCapacity(resource.getCapacity());
        dto.setStatus(resource.getStatus());
        dto.setDescription(resource.getDescription());
        return dto;
    }

    private Resource mapToEntity(ResourceDTO dto) {
        Resource entity = new Resource();
        entity.setName(dto.getName());
        entity.setType(dto.getType());
        entity.setLocation(dto.getLocation());
        entity.setCapacity(dto.getCapacity());
        entity.setStatus(dto.getStatus());
        entity.setDescription(dto.getDescription());
        return entity;
    }
}
