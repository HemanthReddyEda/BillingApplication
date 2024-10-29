package com.example.BillingApplication.config;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.example.BillingApplication.model.Invoice;
import com.example.BillingApplication.model.InvoiceItem;
import com.itextpdf.layout.properties.UnitValue;

import java.io.ByteArrayOutputStream;

public class PdfGenerator {

    public static ByteArrayOutputStream generateInvoicePdf(Invoice invoice) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(new PdfWriter(baos));
        Document document = new Document(pdfDoc);

        // Add invoice details
        document.add(new Paragraph("Invoice ID: " + invoice.getId()));
        document.add(new Paragraph("Customer Name: " + invoice.getCustomer().getName())); // Assuming you have a getName method in Customer
        document.add(new Paragraph("Total Amount: $" + invoice.getTotalAmount()));
        document.add(new Paragraph("Status: " + invoice.getStatus()));
        document.add(new Paragraph(" ")); // Add a space before the table

        // Create a table with 4 columns
        Table table = new Table(4);
        table.setWidth(UnitValue.createPercentValue(100)); // Set table width to 100%

        // Add table headers
        table.addHeaderCell("Product ID");
        table.addHeaderCell("Product Name");
        table.addHeaderCell("Price ($)");
        table.addHeaderCell("Quantity");

        // Add products details to the table
        for (InvoiceItem item : invoice.getProducts()) {
            table.addCell(String.valueOf(item.getProductId())); // Assuming this returns a String
            table.addCell(item.getProductName());
            table.addCell(String.valueOf(item.getPrice())); // Convert price to String
            table.addCell(String.valueOf(item.getQuantity())); // Convert quantity to String
        }

        // Add the table to the document
        document.add(table);
        document.close();
        return baos;
    }
}
