import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Box, Button, Typography, Card, CardContent, Grid, Divider } from '@mui/material';
import { styled } from '@mui/system';

// Styled components for a more modern look
const StyledCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
}));

const TotalContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const Cart = ({ cartItems, onDecreaseQuantity, onIncreaseQuantity, onRemoveItem }) => {
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const navigate = useNavigate();

  const generateInvoice = async (invoiceData) => {
    try {
      const response = await fetch('http://localhost:8080/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      console.log('Invoice generated successfully:', data);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('There was an error generating the invoice. Please try again.');
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ color: '#333' }}>
        Your Cart
      </Typography>
      {cartItems.length === 0 ? (
        <Typography align="center" sx={{ color: '#666' }}>
          No items in the cart.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {cartItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <StyledCard variant="outlined">
                <CardContent>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#007bff' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#555' }}>
                    Price: <strong>₹{item.price.toFixed(2)}</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#555' }}>
                    Quantity: {item.quantity}
                  </Typography>
                  <ButtonContainer>
                    <Button variant="contained" color="primary" onClick={() => onDecreaseQuantity(item.id)}>
                      -
                    </Button>
                    <Typography sx={{ margin: '0 10px' }}>{item.quantity}</Typography>
                    <Button variant="contained" color="primary" onClick={() => onIncreaseQuantity(item.id)}>
                      +
                    </Button>
                    <Button variant="contained" color="error" onClick={() => onRemoveItem(item.id)} sx={{ marginLeft: 2 }}>
                      Remove
                    </Button>
                  </ButtonContainer>
                </CardContent>
                <Divider sx={{ margin: '10px 0' }} />
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
      <TotalContainer>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Total:</Typography>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>₹{total.toFixed(2)}</Typography>
      </TotalContainer>

      {/* PayPal Checkout Button */}
      {cartItems.length > 0 && (
        <PayPalScriptProvider options={{ "client-id": "AazsSDNx2He7HiR5Vv5xFWu9QVDvoEVnBJQuRWqs9pU9EbjDP4CfRpYt_4PEaPJ33voJQrpuGgnl8UPW" }}>
          <PayPalButtons
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: total.toFixed(2),
                  },
                }],
              });
            }}
            onApprove={async (data, actions) => {
              const details = await actions.order.capture();
              alert('Transaction completed by ' + details.payer.name.given_name);
              await generateInvoice({
                customerId: 'exampleCustomerId',
                products: cartItems.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                })),
                totalAmount: total,
              });
              navigate('/invoice');
            }}
            onError={(err) => {
              console.error('PayPal Checkout Error:', err);
              alert('There was an issue with your payment. Please try again.');
            }}
            style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'checkout' }}
          />
        </PayPalScriptProvider>
      )}
    </Box>
  );
}

// PropTypes validation
Cart.propTypes = {
  cartItems: PropTypes.array.isRequired,
  onDecreaseQuantity: PropTypes.func.isRequired,
  onIncreaseQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
};

export default Cart;
