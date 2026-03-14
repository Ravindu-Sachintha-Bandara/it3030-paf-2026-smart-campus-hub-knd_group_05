package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceId(Long resourceId);

    /**
     * Finds overlapping bookings for a given resource that are either APPROVED or
     * PENDING.
     * We ignore CANCELLED or REJECTED bookings when checking for conflicts.
     * Overlap occurs if: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
     */
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
            "AND b.status IN ('APPROVED', 'PENDING') " +
            "AND b.startTime < :endTime " +
            "AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
