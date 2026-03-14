package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingDTO;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.BookingConflictException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return mapToDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDTO createBooking(Long userId, BookingDTO bookingDTO) {

        // 1. Verify Resource exists
        Resource resource = resourceRepository.findById(bookingDTO.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        // 2. Verify User exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (bookingDTO.getStartTime().isAfter(bookingDTO.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // 3. Prevent Double Booking / Overlap logic
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                resource.getId(),
                bookingDTO.getStartTime(),
                bookingDTO.getEndTime());

        if (!overlapping.isEmpty()) {
            throw new BookingConflictException("The resource is already booked during this time frame.");
        }

        // 4. Create Entity
        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUser(user);
        booking.setStartTime(bookingDTO.getStartTime());
        booking.setEndTime(bookingDTO.getEndTime());
        booking.setPurpose(bookingDTO.getPurpose());

        // Default new requests to PENDING
        booking.setStatus(Booking.BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
                user.getId(),
                "Your booking request for " + resource.getName() + " has been submitted and is pending.",
                saved.getId(),
                com.smartcampus.hub.entity.Notification.RelatedEntityType.BOOKING);

        return mapToDTO(saved);
    }

    @Transactional
    public BookingDTO updateBookingStatus(Long bookingId, Booking.BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Only checking conflicts if we are approving it.
        if (newStatus == Booking.BookingStatus.APPROVED) {
            List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                    booking.getResource().getId(),
                    booking.getStartTime(),
                    booking.getEndTime());

            // Note: need to exclude THIS booking from the overlapping check if we do it
            // here, Or
            // we rely on the DB. Since findOverlappingBookings looks for "APPROVED" or
            // "PENDING",
            // and this one is already PENDING, it will find itself.
            // Let's filter out the current booking from the results:
            boolean genuineConflict = overlapping.stream()
                    .anyMatch(b -> !b.getId().equals(bookingId));

            if (genuineConflict) {
                throw new BookingConflictException(
                        "Cannot approve. The resource is already booked during this time frame.");
            }
        }

        booking.setStatus(newStatus);
        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getUser().getId(),
                "Your booking for " + booking.getResource().getName() + " has been " + newStatus.name() + ".",
                savedBooking.getId(),
                com.smartcampus.hub.entity.Notification.RelatedEntityType.BOOKING);

        return mapToDTO(savedBooking);
    }

    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }

    private BookingDTO mapToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setResourceId(booking.getResource().getId());
        dto.setUserId(booking.getUser().getId());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setPurpose(booking.getPurpose());
        return dto;
    }
}
