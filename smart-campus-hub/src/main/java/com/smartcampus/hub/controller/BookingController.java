package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingDTO;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // GET /api/bookings -> retrieve all items
    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET /api/bookings/user/{userId} -> get bookings for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    // GET /api/bookings/{id} -> retrieve a specific item by its ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // POST /api/bookings -> create a new item
    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody BookingDTO bookingDTO,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        BookingDTO createdBooking = bookingService.createBooking(userId, bookingDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    // PUT /api/bookings/{id}/status -> update an item (update status)
    @PutMapping("/{id}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam Booking.BookingStatus status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    // DELETE /api/bookings/{id} -> delete an item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
