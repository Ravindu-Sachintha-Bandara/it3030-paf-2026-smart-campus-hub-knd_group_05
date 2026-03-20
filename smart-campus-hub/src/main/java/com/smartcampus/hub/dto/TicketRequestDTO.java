package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketRequestDTO {

    private Long resourceId;

    @NotBlank(message = "Category is mandatory")
    private String category;

    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotBlank(message = "Description is mandatory")
    private String description;
}
