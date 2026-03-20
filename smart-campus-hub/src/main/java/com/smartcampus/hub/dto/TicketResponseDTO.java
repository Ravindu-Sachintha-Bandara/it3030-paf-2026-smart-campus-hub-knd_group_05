package com.smartcampus.hub.dto;

import com.smartcampus.hub.entity.Ticket;
import lombok.Data;

import java.util.List;

@Data
public class TicketResponseDTO {
    private Long id;
    private Long resourceId;
    private Long reporterId;
    private String title;
    private String description;
    private Ticket.TicketStatus status;
    private String category;
    private String resolutionNotes;
    private List<String> imageUrls;
}
