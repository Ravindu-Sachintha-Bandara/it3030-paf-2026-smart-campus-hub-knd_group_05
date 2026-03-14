package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketResolutionDTO {

    @NotBlank(message = "Resolution notes are required when resolving a ticket")
    private String resolutionNotes;
}
