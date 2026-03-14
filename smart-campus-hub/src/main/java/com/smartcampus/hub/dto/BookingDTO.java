package com.smartcampus.hub.dto;

import com.smartcampus.hub.entity.Booking;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingDTO {

    private Long id;

    @NotNull(message = "Resource ID is mandatory")
    private Long resourceId;

    // In a real application, userId might be extracted from the JWT token rather
    // than passed in the DTO,
    // but we include it here for completeness/admin overrides.
    private Long userId;

    @NotNull(message = "Start time is mandatory")
    @FutureOrPresent(message = "Start time cannot be in the past")
    private LocalDateTime startTime;

    @NotNull(message = "End time is mandatory")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    private Booking.BookingStatus status;

    @NotBlank(message = "Purpose is mandatory")
    private String purpose;
}
