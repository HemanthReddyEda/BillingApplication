package com.example.BillingApplication.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "invoices")
public class Invoice {
    @Id
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties("invoices") // Ignore the invoices field in Customer
    private Customer customer;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "status")
    private String status;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("invoice") // Ignore the invoice field in InvoiceItem
    private List<InvoiceItem> products;

    public void calculateTotalAmount() {
        totalAmount = products.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    public Double getPaidAmount() {
        return products.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }
}
