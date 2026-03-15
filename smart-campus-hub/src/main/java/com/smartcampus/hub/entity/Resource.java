package com.smartcampus.hub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "resources")
@Getter
@Setter
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Resource name is mandatory")
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Resource type is mandatory")
    @Column(nullable = false)
    private ResourceType type;

    @NotBlank(message = "Location is mandatory")
    @Column(nullable = false)
    private String location;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity; // Nullable for equipment that doesn't have a capacity

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status is mandatory")
    @Column(nullable = false)
    private ResourceStatus status;

    private String description;

    public enum ResourceType {
        LECTURE_HALL,
        LABORATORY,
        EQUIPMENT,
        MEETING_ROOM,
        ROOM,
        OUTDOOR,
        OTHER
    }

    public enum ResourceStatus {
        AVAILABLE,
        IN_USE,
        MAINTENANCE,
        OUT_OF_SERVICE
    }
}
