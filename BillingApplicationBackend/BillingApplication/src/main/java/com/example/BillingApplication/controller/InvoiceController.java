package com.example.BillingApplication.controller;

import com.example.BillingApplication.model.EmailRequest; // Ensure this is imported
import com.example.BillingApplication.model.Invoice;
import com.example.BillingApplication.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Import ResponseEntity
import org.springframework.http.HttpStatus; // Import HttpStatus
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @Autowired
    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public Invoice createInvoice(@RequestBody Invoice invoice) {
        // Create the invoice
        Invoice createdInvoice = invoiceService.createInvoice(invoice);

        // Return the created invoice directly
        return createdInvoice;
    }

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices(); // Return the list directly
    }

    @GetMapping("/{id}")
    public Invoice getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id); // Return the invoice directly
    }

    // New endpoint to send an invoice email
    @PostMapping("/send-email")
    public ResponseEntity<String> sendInvoiceEmail(@RequestBody EmailRequest emailRequest) {
        boolean emailSent = invoiceService.sendInvoiceEmail(emailRequest.getCustomerId(), emailRequest.getInvoiceId());
        if (emailSent) {
            return ResponseEntity.ok("Invoice PDF email sent successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send invoice PDF email.");
        }
    }
}
