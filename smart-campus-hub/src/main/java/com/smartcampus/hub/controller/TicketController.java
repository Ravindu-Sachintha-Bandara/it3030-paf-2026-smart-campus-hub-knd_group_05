package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.TicketRequestDTO;
import com.smartcampus.hub.dto.TicketResolutionDTO;
import com.smartcampus.hub.dto.TicketResponseDTO;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // GET /api/tickets -> retrieve all items
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET /api/tickets/{id} -> retrieve a specific item by its ID
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // POST /api/tickets -> create a new item
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestPart("ticket") @Valid TicketRequestDTO ticketRequestDTO,
            @RequestPart(value = "images", required = false) MultipartFile[] images,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        
        TicketResponseDTO createdTicket = ticketService.createTicket(userId, ticketRequestDTO, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
    }

    // PUT /api/tickets/{id}/status -> update an item's status
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam Ticket.TicketStatus status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    // PUT /api/tickets/{id}/resolve -> update an item via resolution
    @PutMapping("/{id}/resolve")
    public ResponseEntity<TicketResponseDTO> resolveTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketResolutionDTO resolutionDTO) {
        return ResponseEntity.ok(ticketService.resolveTicket(id, resolutionDTO));
    }
}
