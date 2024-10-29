package com.example.BillingApplication.service;

import com.example.BillingApplication.config.PdfGenerator;
import com.example.BillingApplication.model.Customer;
import com.example.BillingApplication.model.EmailRequest; // Ensure this is imported
import com.example.BillingApplication.model.Invoice;
import com.example.BillingApplication.model.InvoiceItem;
import com.example.BillingApplication.repository.CustomerRepository;
import com.example.BillingApplication.repository.InvoiceRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Random;

@Service
public class InvoiceService {
    private final JavaMailSender mailSender;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    @Autowired
    public InvoiceService(JavaMailSender mailSender, InvoiceRepository invoiceRepository, CustomerRepository customerRepository) {
        this.mailSender = mailSender;
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
    }

    public Long generateUniqueInvoiceId() {
        Long newId;
        do {
            newId = generateRandomId();
        } while (invoiceRepository.existsById(newId));
        return newId;
    }

    private Long generateRandomId() {
        Random random = new Random();
        return (long) (100000 + random.nextInt(900000)); // Generates a random ID between 100000 and 999999
    }

    public Invoice createInvoice(Invoice invoice) {
        System.out.println("Received invoice: " + invoice);

        // Validate the invoice and its items
        if (invoice.getProducts() == null || invoice.getProducts().isEmpty()) {
            throw new IllegalArgumentException("Invoice must have at least one product.");
        }

        // Check if customer is set
        if (invoice.getCustomer() == null || invoice.getCustomer().getId() == null) {
            throw new IllegalArgumentException("Invoice must be associated with a valid customer.");
        }

        // Set the invoice reference for each item and validate product ID
        for (InvoiceItem item : invoice.getProducts()) {
            if (item.getProductId() == null) {
                throw new IllegalArgumentException("Each InvoiceItem must have a valid product ID.");
            }
            item.setInvoice(invoice); // Set the reference to the invoice
        }

        // Generate a unique invoice ID
        invoice.setId(generateUniqueInvoiceId());

        // Set status to "Paid" by default
        invoice.setStatus("Paid");

        // Calculate the total amount for the invoice
        invoice.calculateTotalAmount();

        // Save the invoice and return
        return invoiceRepository.save(invoice);
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id).orElse(null);
    }

    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public boolean sendInvoiceEmail(Long customerId, Long invoiceId) {
        try {
            // Retrieve the customer’s email using the customerId
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

            // Retrieve the invoice
            Invoice invoice = getInvoiceById(invoiceId);
            if (invoice == null) {
                throw new IllegalArgumentException("Invoice not found");
            }

            // Generate the PDF
            ByteArrayOutputStream pdfContent = PdfGenerator.generateInvoicePdf(invoice);

            // Prepare the email with attachment
            sendEmailWithAttachment(customer.getEmail(), invoice, pdfContent.toByteArray());
            return true;
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for more context
            return false;
        }
    }

    private void sendEmailWithAttachment(String customerEmail, Invoice invoice, byte[] pdfContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(customerEmail); // Use the customer's email
        helper.setSubject("Invoice #" + invoice.getId());
        helper.setText("Please find attached the invoice for your recent purchase.");

        // Add PDF attachment
        helper.addAttachment("Invoice_" + invoice.getId() + ".pdf", new ByteArrayResource(pdfContent));

        mailSender.send(message);
    }

}
