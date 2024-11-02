package com.example.BillingApplication.repository;

import com.example.BillingApplication.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCreatedAtBetween(LocalDateTime localDateTime, LocalDateTime localDateTime1);
}
