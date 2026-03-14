package com.smartcampus.hub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // To optionally link this notification to a specific item for deep linking
    private Long relatedEntityId;

    @Enumerated(EnumType.STRING)
    private RelatedEntityType relatedEntityType;

    public enum RelatedEntityType {
        BOOKING,
        TICKET,
        SYSTEM
    }
}
