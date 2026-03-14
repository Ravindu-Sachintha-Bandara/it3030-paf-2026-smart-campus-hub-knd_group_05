package com.smartcampus.hub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.hub.dto.TicketRequestDTO;
import com.smartcampus.hub.dto.TicketResponseDTO;
import com.smartcampus.hub.entity.Ticket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.smartcampus.hub.security.JwtUtil;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.smartcampus.hub.SmartCampusHubApplication;

@SpringBootTest(classes = SmartCampusHubApplication.class)
@AutoConfigureMockMvc(addFilters = false)
public class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.smartcampus.hub.service.TicketService ticketService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private com.smartcampus.hub.service.GeminiService geminiService;

    @Autowired
    private ObjectMapper objectMapper;

    private TicketResponseDTO sampleResponse;
    private TicketRequestDTO sampleRequest;

    @BeforeEach
    void setUp() {
        sampleResponse = new TicketResponseDTO();
        sampleResponse.setId(1L);
        sampleResponse.setTitle("Fix AC in Room 101");
        sampleResponse.setDescription("The AC is leaking water.");
        sampleResponse.setStatus(Ticket.TicketStatus.OPEN);
        sampleResponse.setCategory(Ticket.TicketCategory.HVAC);

        sampleRequest = new TicketRequestDTO();
        sampleRequest.setResourceId(2L);
        sampleRequest.setTitle("Fix AC in Room 101");
        sampleRequest.setDescription("The AC is leaking water.");
    }

    @Test
    @WithMockUser // Provide a mocked security context if addFilters=false isn't enough
    void testGetAllTickets() throws Exception {
        List<TicketResponseDTO> tickets = Arrays.asList(sampleResponse);
        Mockito.when(ticketService.getAllTickets()).thenReturn(tickets);

        mockMvc.perform(get("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Fix AC in Room 101"));
    }

    @Test
    @WithMockUser
    void testGetTicketById() throws Exception {
        Mockito.when(ticketService.getTicketById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/tickets/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Fix AC in Room 101"));
    }

    @Test
    @WithMockUser
    void testCreateTicket() throws Exception {
        Mockito.when(ticketService.createTicket(any(), any(), any())).thenReturn(sampleResponse);

        // Convert the Request DTO to a JSON byte array for the multipart request
        byte[] requestJson = objectMapper.writeValueAsBytes(sampleRequest);
        MockMultipartFile ticketPart = new MockMultipartFile("ticket", "", "application/json", requestJson);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/tickets")
                .file(ticketPart)
                .param("userId", "1")
                .with(csrf())) // Provide CSRF token if required by security context
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Fix AC in Room 101"));
    }

    @Test
    @WithMockUser
    void testUpdateTicketStatus() throws Exception {
        sampleResponse.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        Mockito.when(ticketService.updateTicketStatus(eq(1L), eq(Ticket.TicketStatus.IN_PROGRESS)))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/tickets/{id}/status", 1L)
                .param("status", "IN_PROGRESS")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }
}
