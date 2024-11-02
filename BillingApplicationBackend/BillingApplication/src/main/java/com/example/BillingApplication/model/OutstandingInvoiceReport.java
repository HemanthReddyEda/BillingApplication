package com.example.BillingApplication.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OutstandingInvoiceReport {
    private Long invoiceId;
    private Long customerId;
    private LocalDateTime dueDate;
    private Double outstandingAmount;
}
