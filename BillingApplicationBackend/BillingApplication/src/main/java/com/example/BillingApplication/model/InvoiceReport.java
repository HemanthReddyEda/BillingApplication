package com.example.BillingApplication.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InvoiceReport {
    private Long invoiceId;
    private LocalDateTime invoiceDate;
    private Double totalAmount;
    private Double paidAmount;
    private Double outstandingAmount;
}
