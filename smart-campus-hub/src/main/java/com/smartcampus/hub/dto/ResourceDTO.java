package com.smartcampus.hub.dto;

import com.smartcampus.hub.entity.Resource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceDTO {

    // ID is omitted for creates, but returned on responses
    private Long id;

    @NotBlank(message = "Resource name is mandatory")
    private String name;

    @NotNull(message = "Resource type is mandatory")
    private Resource.ResourceType type;

    @NotBlank(message = "Location is mandatory")
    private String location;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private Resource.ResourceStatus status; // Usually defaulted to AVAILABLE on creation

    private String description;
}
