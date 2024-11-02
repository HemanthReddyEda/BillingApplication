import { useEffect, useState } from 'react';
import { getInvoices } from '../../services/api';
import jsPDF from 'jspdf';
import './InvoiceList.css'; // Import your CSS file

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await getInvoices();
        console.log('Raw API response:', response.data);
        const invoiceData = response.data;
        setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setError('Failed to load invoices. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDownloadInvoice = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Invoice ID: ${invoice.id}`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Customer Name: ${invoice.customer.name}`, 10, 20);
    doc.text(`Total Amount: $${invoice.totalAmount.toFixed(2)}`, 10, 30);
    doc.text(`Status: ${invoice.status}`, 10, 40);
    doc.text('Products:', 10, 50);
    let y = 60;
    invoice.products.forEach((product, index) => {
      doc.text(`${index + 1}. Product ID: ${product.productId}, Price: $${product.price}, Quantity: ${product.quantity}`, 10, y);
      y += 10;
    });
    doc.save(`Invoice_${invoice.id}.pdf`);
  };

  if (loading) {
    return <div className="loading">Loading invoices...</div>;
  }

  return (
    <div className="invoice-list">
      <h2 className="invoice-header">Invoice List</h2>
      {error && <p className="error-message">{error}</p>}
      {invoices.length === 0 ? (
        <p className="no-invoices">No invoices available.</p>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.customer.name}</td>
                <td>${invoice.totalAmount.toFixed(2)}</td>
                <td>{invoice.status}</td>
                <td>
                  <button className="download-button" onClick={() => handleDownloadInvoice(invoice)}>Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InvoiceList;
