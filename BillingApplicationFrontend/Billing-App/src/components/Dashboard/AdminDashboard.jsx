import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getCustomers, addCustomer, deleteCustomer } from '../../services/api';
import ProductList from '../Product/ProductList';
import GenerateInvoice from '../Invoice/GenerateInvoice';
import InvoiceList from '../Invoice/InvoiceList';
import InvoiceReportComponent from '../Reports/InvoiceReportComponent'; // Import report components
import OutstandingInvoiceReportComponent from '../Reports/OutstandingInvoiceReportComponent'; // Import outstanding invoice report component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserPlus, faUsers, faFileInvoice, faFileInvoiceDollar, faSignOutAlt, faBoxOpen, faBars } from '@fortawesome/free-solid-svg-icons';
import './dashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);
  const [newCustomers, setNewCustomers] = useState([{ id: '', name: '', email: '' }]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState('products'); // Default section
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductsAndCustomers = async () => {
      setLoading(true);
      try {
        const productResponse = await getProducts();
        const customerResponse = await getCustomers();
        setProducts(productResponse.data);
        setCustomers(customerResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Error loading data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductsAndCustomers();
  }, []);

  const handleAddCustomer = async () => {
    const invalidCustomer = newCustomers.find((customer) => !customer.id || !customer.name || !customer.email);
    if (invalidCustomer) {
      setErrorMessage('Each customer must have a valid ID, name, and email.');
      return;
    }

    setLoading(true);
    try {
      const response = await Promise.all(newCustomers.map((customer) => addCustomer(customer)));
      setCustomers([...customers, ...response.map((res) => res.data)]);
      setNewCustomers([{ id: '', name: '', email: '' }]);
      setErrorMessage('');
      toast.success('Customers added successfully.');
    } catch (error) {
      console.error('Error adding customers:', error);
      setErrorMessage('Failed to add customers. Please check the provided details.');
    } finally {
      setLoading(false);
    }
  };

  const addNewCustomerField = () => {
    setNewCustomers([...newCustomers, { id: '', name: '', email: '' }]);
  };

  const handleCustomerChange = (index, field, value) => {
    const updatedCustomers = newCustomers.map((customer, idx) =>
      idx === index ? { ...customer, [field]: value } : customer
    );
    setNewCustomers(updatedCustomers);
  };

  const handleRemoveCustomerField = (index) => {
    const updatedCustomers = newCustomers.filter((_, idx) => idx !== index);
    setNewCustomers(updatedCustomers);
  };

  const handleDeleteCustomer = async (customerId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;
  
    console.log('customerId:', customerId, 'Type:', typeof customerId);
    setLoading(true);
  
    // Use customerId directly, assuming it’s already a valid ID
    const updatedCustomers = customers.filter((c) => c.id !== customerId); // Ensure matching types
    setCustomers(updatedCustomers);
    toast.info('Deleting customer...');
  
    try {
      await deleteCustomer(customerId); // Use customerId directly
      toast.success('Customer deleted successfully.');
    } catch (error) {
      console.error('Error deleting customer:', error);
      setErrorMessage('Failed to delete customer. Please try again.');
      // Revert to original state if error occurs
      setCustomers(customers);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleSelectSection = (section) => {
    setCurrentSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-dashboard">
      <div className="navbar">
        <FontAwesomeIcon
          icon={faBars}
          className="hamburger-icon"
          onClick={toggleSidebar}
          title="Menu"
        />
        <h2 className="navbar-title">Admin Dashboard</h2>
        <FontAwesomeIcon
          icon={faSignOutAlt}
          className="logout-icon"
          onClick={() => navigate('/logout')}
          title="Logout"
        />
      </div>
      {loading && <p className="loading">Loading...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSidebar}>✖</button>
        <h3>Admin Menu</h3>
        <ul>
          <li onClick={() => handleSelectSection('products')}>
            <FontAwesomeIcon icon={faBoxOpen} /> Products
          </li>
          <li onClick={() => handleSelectSection('customers')}>
            <FontAwesomeIcon icon={faUsers} /> Customers
          </li>
          <li onClick={() => handleSelectSection('addCustomers')}>
            <FontAwesomeIcon icon={faUserPlus} /> Add New Customers
          </li>
          <li onClick={() => handleSelectSection('invoices')}>
            <FontAwesomeIcon icon={faFileInvoice} /> Invoice List
          </li>
          <li onClick={() => handleSelectSection('generateInvoice')}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} /> Generate Invoice
          </li>
          <li onClick={() => handleSelectSection('invoiceReports')}>
            <FontAwesomeIcon icon={faFileInvoice} /> Invoice Reports
          </li>
          <li onClick={() => handleSelectSection('outstandingReports')}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} /> Outstanding Invoice Reports
          </li>
        </ul>
      </div>

      <div className="dashboard-body">
        <div className="content">
          {currentSection === 'products' && <ProductList role="admin" />}
          {currentSection === 'invoices' && <InvoiceList />}
          {currentSection === 'generateInvoice' && <GenerateInvoice />}
          {currentSection === 'invoiceReports' && <InvoiceReportComponent />}
          {currentSection === 'outstandingReports' && <OutstandingInvoiceReportComponent />}
          {currentSection === 'addCustomers' && (
            <div className="customer-section">
              <h3>Add New Customers</h3>
              {newCustomers.map((customer, index) => (
                <div key={index} className="customer-form">
                  <input
                    className="customer-input"
                    placeholder="Customer ID"
                    value={customer.id}
                    onChange={(e) => handleCustomerChange(index, 'id', e.target.value)}
                  />
                  <input
                    className="customer-input"
                    placeholder="Name"
                    value={customer.name}
                    onChange={(e) => handleCustomerChange(index, 'name', e.target.value)}
                  />
                  <input
                    className="customer-input"
                    placeholder="Email"
                    value={customer.email}
                    onChange={(e) => handleCustomerChange(index, 'email', e.target.value)}
                  />
                  <button className="btn btn-remove" onClick={() => handleRemoveCustomerField(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <button className="btn" onClick={addNewCustomerField}>
                <FontAwesomeIcon icon={faUserPlus} /> Add Another Customer
              </button>
              <button className="btn btn-add" onClick={handleAddCustomer}>Add Customers</button>
            </div>
          )}
          {currentSection === 'customers' && (
            <div className="customer-section">
              <h3>Customers</h3>
              {customers.length === 0 ? (
                <p>No customers available.</p>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className="customer-card">
                    <div className="customer-info">
                      <p>ID: {customer.id}</p>
                      <p>Name: {customer.name}</p>
                      <p>Email: {customer.email}</p>
                    </div>
                    <button className="btn btn-delete" onClick={() => handleDeleteCustomer(customer.id)}>
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;
