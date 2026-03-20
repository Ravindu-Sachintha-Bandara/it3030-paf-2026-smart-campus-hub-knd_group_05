package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.TicketRequestDTO;
import com.smartcampus.hub.dto.TicketResolutionDTO;
import com.smartcampus.hub.dto.TicketResponseDTO;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final GeminiService geminiService;

    // Define in application.yml, e.g., file.upload-dir=uploads/
    @Value("${file.upload-dir:uploads/tickets/}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return mapToDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO createTicket(Long userId, TicketRequestDTO requestDTO, MultipartFile[] images) {

        Resource resource = null;
        if (requestDTO.getResourceId() != null) {
            resource = resourceRepository.findById(requestDTO.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate max 3 images
        if (images != null && images.length > 3) {
            throw new IllegalArgumentException("A maximum of 3 image attachments are allowed.");
        }

        Ticket ticket = new Ticket();
        ticket.setResource(resource);
        ticket.setReporter(user);
        ticket.setTitle(requestDTO.getTitle());
        ticket.setDescription(requestDTO.getDescription());
        ticket.setStatus(Ticket.TicketStatus.OPEN);

        String category = requestDTO.getCategory();
        if (category == null || category.trim().isEmpty() || category.equals("Select Category")) {
            // Use Gemini AI as fallback if no category is provided
            category = geminiService.categorizeTicketDescription(
                    requestDTO.getTitle(),
                    requestDTO.getDescription());
        }
        ticket.setCategory(category);

        List<String> savedImageUrls = saveUploadedFiles(images);
        ticket.setImageUrls(savedImageUrls);

        Ticket savedTicket = ticketRepository.save(ticket);

        String resourceText = resource != null ? " regarding " + resource.getName() : "";
        notificationService.createNotification(
                user.getId(),
                "Ticket #" + savedTicket.getId() + resourceText + " has been created.",
                savedTicket.getId(),
                com.smartcampus.hub.entity.Notification.RelatedEntityType.TICKET);

        return mapToDTO(savedTicket);
    }

    @Transactional
    public TicketResponseDTO updateTicketStatus(Long id, Ticket.TicketStatus newStatus) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(newStatus);
        Ticket savedTicket = ticketRepository.save(ticket);

        notificationService.createNotification(
                ticket.getReporter().getId(),
                "Ticket #" + ticket.getId() + " status updated to " + newStatus.name() + ".",
                ticket.getId(),
                com.smartcampus.hub.entity.Notification.RelatedEntityType.TICKET);

        return mapToDTO(savedTicket);
    }

    @Transactional
    public TicketResponseDTO resolveTicket(Long id, TicketResolutionDTO resolutionDTO) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (ticket.getStatus() == Ticket.TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot resolve a closed ticket.");
        }

        ticket.setStatus(Ticket.TicketStatus.RESOLVED);
        ticket.setResolutionNotes(resolutionDTO.getResolutionNotes());

        Ticket savedTicket = ticketRepository.save(ticket);

        notificationService.createNotification(
                ticket.getReporter().getId(),
                "Ticket #" + ticket.getId() + " has been resolved.",
                ticket.getId(),
                com.smartcampus.hub.entity.Notification.RelatedEntityType.TICKET);

        return mapToDTO(savedTicket);
    }

    /**
     * Internal method to save multipart files to the local file system.
     * In a production enterprise app, this would upload to AWS S3, Azure Blob, etc.
     */
    private List<String> saveUploadedFiles(MultipartFile[] files) {
        List<String> fileUrls = new ArrayList<>();
        if (files == null || files.length == 0)
            return fileUrls;

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                if (file.isEmpty())
                    continue;

                // Validate content type is actually an image
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    throw new IllegalArgumentException("Only image files are allowed.");
                }

                // Generate unique filename to prevent overwrites
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename != null && originalFilename.contains(".")
                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
                        : ".png";
                String uniqueFilename = UUID.randomUUID().toString() + extension;

                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Return a URL path that an ImageController can serve,
                // e.g., /api/images/tickets/abc-123.jpg
                fileUrls.add("/api/images/tickets/" + uniqueFilename);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image files", e);
        }

        return fileUrls;
    }

    private TicketResponseDTO mapToDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        if (ticket.getResource() != null) {
            dto.setResourceId(ticket.getResource().getId());
        }
        dto.setReporterId(ticket.getReporter().getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setStatus(ticket.getStatus());
        dto.setCategory(ticket.getCategory());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setImageUrls(ticket.getImageUrls());
        return dto;
    }
}
