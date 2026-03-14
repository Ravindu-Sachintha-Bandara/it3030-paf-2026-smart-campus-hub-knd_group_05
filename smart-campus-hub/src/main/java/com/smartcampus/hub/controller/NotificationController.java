package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.NotificationDTO;
import com.smartcampus.hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications -> retrieve all items (for a user)
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId, unreadOnly));
    }

    // PUT /api/notifications/{id}/read -> update an item (mark as read)
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id, 
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        notificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/notifications/read-all -> update multiple items (mark all as read)
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
