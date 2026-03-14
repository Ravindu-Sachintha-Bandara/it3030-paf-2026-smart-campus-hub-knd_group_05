package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.NotificationDTO;
import com.smartcampus.hub.entity.Notification;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.NotificationRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(Long userId, String message, Long relatedEntityId,
            Notification.RelatedEntityType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRelatedEntityType(type);

        notificationRepository.save(notification);

        // In a real-time app, you would also trigger a WebSocket event here to push to
        // the React client
        // e.g., simpMessagingTemplate.convertAndSendToUser(user.getEmail(),
        // "/queue/notifications", dto);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(Long userId, boolean unreadOnly) {
        List<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return notifications.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        // Ensure user owns notification
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to mark this notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser().getId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRelatedEntityId(notification.getRelatedEntityId());
        dto.setRelatedEntityType(notification.getRelatedEntityType());
        return dto;
    }
}
