package com.smartcampus.hub.dto;

import com.smartcampus.hub.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedEntityId;
    private Notification.RelatedEntityType relatedEntityType;
}
