import { useState } from 'react';
import { generateInvoice, sendInvoiceEmail, getProductDetails } from '../../services/api';

function GenerateInvoice() {
  const [formData, setFormData] = useState({ customerId: '' });
  const [message, setMessage] = useState('');
  const [productInputs, setProductInputs] = useState([{ id: '', price: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);

  const handleProductChange = async (index, field, value) => {
    const updatedInputs = [...productInputs];
    updatedInputs[index][field] = value;

    // If the field is 'id', fetch product details
    if (field === 'id' && value) {
      try {
        const response = await getProductDetails(value);
        const productDetails = response.data; // Assuming productDetails has 'price' field
        updatedInputs[index].price = productDetails.price || 0; // Use price from the response
      } catch (error) {
        console.error('Error fetching product details:', error);
        setMessage('Error fetching product details. Please check the Product ID.');
        updatedInputs[index].price = ''; // Reset price if error occurs
      }
    }

    setProductInputs(updatedInputs);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    setProductInputs([...productInputs, { id: '', price: '', quantity: 1 }]);
  };

  const handleRemoveProduct = (index) => {
    const updatedInputs = productInputs.filter((_, i) => i !== index);
    setProductInputs(updatedInputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const invoiceData = {
      customer: { id: formData.customerId },
      products: await Promise.all(
        productInputs.map(async (product) => {
          // Fetch product details to get the productName
          try {
            const productDetails = await getProductDetails(product.id);
            return {
              productId: product.id,
              productName: productDetails.data.name, // Assuming productDetails has a 'name' field
              price: parseFloat(product.price),
              quantity: parseInt(product.quantity, 10),
            };
          } catch (error) {
            console.error('Error fetching product details:', error);
            setMessage(`Error fetching details for Product ID: ${product.id}`);
            return null; // Skip this product in the invoice
          }
        })
      ).then(results => results.filter(Boolean)), // Filter out nulls from failed fetches
    };

    try {
      const response = await generateInvoice(invoiceData);
      setMessage(`Invoice generated successfully! ID: ${response.data.id}`);
      setProductInputs([{ id: '', price: '', quantity: 1 }]);
      setFormData({ customerId: '' });

      await sendInvoiceEmail({
        customerId: formData.customerId,
        invoiceId: response.data.id,
      });
      setMessage('Invoice generated and email sent successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      setMessage(`Failed to generate invoice: ${error.response?.data?.message || 'Invalid data sent.'}`);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = productInputs.reduce((total, product) => {
    const price = parseFloat(product.price) || 0;
    const quantity = parseInt(product.quantity, 10) || 0;
    return total + (price * quantity);
  }, 0);

  return (
    <div>
      <h2>Generate Invoice</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Customer ID"
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
          required
        />
        {productInputs.map((input, index) => (
          <div key={index}>
            <input
              placeholder="Product ID"
              value={input.id}
              onChange={(e) => handleProductChange(index, 'id', e.target.value)}
              required
            />
            <input
              placeholder="Price"
              type="number"
              value={input.price}
              onChange={(e) => handleProductChange(index, 'price', e.target.value)}
              required
              readOnly // Make price read-only since it will be fetched automatically
            />
            <input
              placeholder="Quantity"
              type="number"
              value={input.quantity}
              onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
              min="1"
              required
            />
            <button type="button" onClick={() => handleRemoveProduct(index)}>Remove</button>
          </div>
        ))}
        <button onClick={handleAddProduct}>Add Another Product</button>

        <p>Total Amount: ${totalAmount.toFixed(2)}</p>
        <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Invoice'}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default GenerateInvoice;
