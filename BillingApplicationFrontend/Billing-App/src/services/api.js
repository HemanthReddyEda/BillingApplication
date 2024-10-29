import axios from 'axios';

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Update with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Product endpoints
export const getProducts = () => api.get('/products');
export const getProductDetails = (id) => api.get(`/products/${id}`);
export const addProduct = (data) => api.post('/products', data); // Endpoint to add a new product
export const updateProduct = (id, data) => api.put(`/products/${id}`, data); // Endpoint to update a product
export const deleteProduct = (id) => api.delete(`/products/${id}`); // Endpoint to delete a product

// Customer endpoints
export const getCustomers = () => api.get('/customers');
export const getCustomerProfile = (id) => api.get(`/auth/profile/${id}`);
export const updateCustomerProfile = (userId, data) => 
  api.put('/customers/profile', { userId, ...data }); 
export const addCustomer = (data) => api.post('/customers', data); // Endpoint to add a new customer
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data); // Endpoint to update a customer
export const deleteCustomer = (id) => api.delete(`/customers/${id}`); // Endpoint to delete a customer

// Invoice endpoints
export const getInvoices = () => api.get('/invoices');
export const generateInvoice = (data) => api.post('/invoices', data); // Endpoint to generate a new invoice
export const getInvoiceById = (id) => api.get(`/invoices/${id}`); // Endpoint to get invoice details by ID
export const sendInvoiceEmail = (data) => api.post('/invoices/send-email', data); // Email endpoint

// Cart endpoints
export const getCartItems = () => api.get('/cart'); // Get all cart items
export const addToCart = (productId, quantity = 1) => api.post('/cart', { productId, quantity }); // Add item to cart with optional quantity
export const removeFromCart = (id) => api.delete(`/cart/${id}`); // Remove item from cart
export const checkout = () => api.post('/cart/checkout'); // Checkout cart

// Payment endpoints
export const recordPayment = (invoiceId, data) => api.post(`/payments/${invoiceId}`, data); // Record a payment for an invoice
export const getPaymentStatus = (invoiceId) => api.get(`/payments/status/${invoiceId}`); // Get payment status

// Reports endpoints
export const getInvoiceReports = () => api.get('/reports/invoices'); 
export const getCustomerReports = () => api.get('/reports/customers'); 
export const getSalesReport = (startDate, endDate) => api.get(`/reports/sales?start=${startDate}&end=${endDate}`); // Get sales report within a date range

export default api;
