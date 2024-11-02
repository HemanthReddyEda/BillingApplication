import React, { useState } from 'react';
import {
  generateInvoice,
  sendInvoiceEmail,
  getProductDetails,
  getInvoiceReports,
  getCustomerReports,
} from '../../services/api';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { Add, Remove, ShoppingCart } from '@mui/icons-material';

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));
Alert.displayName = 'Alert';

function GenerateInvoice({ setInvoiceReports, setCustomerReports }) {
  const [formData, setFormData] = useState({ customerId: '' });
  const [message, setMessage] = useState('');
  const [productInputs, setProductInputs] = useState([{ id: '', price: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  const handleProductChange = async (index, field, value) => {
    const updatedInputs = [...productInputs];
    updatedInputs[index][field] = value;

    if (field === 'id' && value) {
      setProductLoading(true);
      try {
        const response = await getProductDetails(value);
        const productDetails = response.data;
        updatedInputs[index].price = productDetails.price || 0;
      } catch (error) {
        console.error('Error fetching product details:', error);
        setMessage('Error fetching product details. Please check the Product ID.');
        updatedInputs[index].price = '';
      } finally {
        setProductLoading(false);
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
          if (!product.id || !product.quantity) return null;
          try {
            const productDetails = await getProductDetails(product.id);
            return {
              productId: product.id,
              productName: productDetails.data.name,
              price: parseFloat(product.price),
              quantity: parseInt(product.quantity, 10),
            };
          } catch (error) {
            console.error('Error fetching product details:', error);
            setMessage(`Error fetching details for Product ID: ${product.id}`);
            return null;
          }
        })
      ).then((results) => results.filter(Boolean)),
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

      const [invoices, customers] = await Promise.all([getInvoiceReports(), getCustomerReports()]);
      setInvoiceReports(invoices.data);
      setCustomerReports(customers.data);
    } catch (error) {
      console.error('Error generating invoice:', error);
      setMessage(`Failed to generate invoice: ${error.response?.data?.message || 'Invalid data sent.'}`);
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  const totalAmount = productInputs.reduce((total, product) => {
    const price = parseFloat(product.price) || 0;
    const quantity = parseInt(product.quantity, 10) || 0;
    return total + price * quantity;
  }, 0);

  return (
    <Paper
      elevation={5}
      style={{
        padding: '20px',
        maxWidth: '600px',
        margin: 'auto',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        style={{ color: '#3f51b5', marginBottom: '20px' }}
      >
        <ShoppingCart fontSize="large" /> Generate Invoice
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Customer ID"
          variant="outlined"
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
          required
          style={{ marginBottom: '16px', backgroundColor: '#f9f9f9' }}
        />
        {productInputs.map((input, index) => (
          <Grid container spacing={2} key={index} alignItems="flex-end" style={{ marginBottom: '16px' }}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Product ID"
                value={input.id}
                onChange={(e) => handleProductChange(index, 'id', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={input.price}
                onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                required
                InputProps={{ readOnly: true }} // Price is auto-filled
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={input.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                min="1"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveProduct(index)}
                startIcon={<Remove />}
              >
                Remove
              </Button>
            </Grid>
          </Grid>
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddProduct}
          style={{ margin: '16px 0' }}
          startIcon={<Add />}
        >
          Add Another Product
        </Button>

        <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '16px' }}>
          Total Amount: ${totalAmount.toFixed(2)}
        </Typography>
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Generate Invoice'}
        </Button>
      </form>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="info" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

GenerateInvoice.propTypes = {
  setInvoiceReports: PropTypes.func.isRequired,
  setCustomerReports: PropTypes.func.isRequired,
};

GenerateInvoice.defaultProps = {
  setInvoiceReports: () => {},
  setCustomerReports: () => {},
};

export default GenerateInvoice;
