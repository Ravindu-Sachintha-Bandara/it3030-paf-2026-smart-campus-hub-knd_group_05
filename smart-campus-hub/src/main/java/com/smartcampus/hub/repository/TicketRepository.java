package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByResourceId(Long resourceId);

    List<Ticket> findByReporterId(Long reporterId);

    List<Ticket> findByStatus(Ticket.TicketStatus status);
}
