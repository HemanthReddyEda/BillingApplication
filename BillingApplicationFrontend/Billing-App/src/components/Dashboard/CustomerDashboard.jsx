import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ProductList from '../Product/ProductList';
import Cart from '../Product/Cart';
import { getProducts, updateCustomerProfile, getCustomerProfile } from '../../services/api';
import './CustomerDashboard.css';

function CustomerDashboard({ onSignOut }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  // Fetch user ID from local storage
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const response = await getCustomerProfile(userId);
          setUser(response.data);
          setEditedUser(response.data || { name: '', email: '' });
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchProducts();
    fetchUserProfile();
  }, [userId]);

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleCartQuantity = (productId, operation) => {
    setCartItems(cartItems.map(item => {
      if (item.id === productId) {
        const newQuantity = operation === 'increase' ? item.quantity + 1 : item.quantity - 1;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleEditProfile = () => {
    setIsEditing(prev => !prev);
    if (!isEditing && user) {
      setEditedUser({ ...user });
      setError(''); // Reset error on edit
    }
  };

  const handleSaveProfile = async () => {
    // Validation for empty fields
    if (!editedUser.name || !editedUser.email) {
      setError("Name and Email cannot be empty");
      return; // Stop the function if validation fails
    }

    try {
      await updateCustomerProfile(userId, editedUser);
      setUser(editedUser);
      setIsEditing(false);
      setError(''); // Clear error after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  return (
    <div className="customer-dashboard">
      <h1>Customer Dashboard</h1>
      <div className="dashboard-actions">
        <button onClick={handleEditProfile} className="edit-profile-button">
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
        <button onClick={onSignOut} className="sign-out-button">
          Sign Out
        </button>
      </div>

      {isEditing && (
        <div className="edit-profile-form">
          <h2>Edit Profile</h2>
          {error && <div className="error-message">{error}</div>}
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={editedUser.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </label>
          <button onClick={handleSaveProfile} className="save-profile-button">
            Save
          </button>
        </div>
      )}

      <h2>Products</h2>
      <ProductList 
        role="customer" 
        products={products} 
        onAddToCart={handleAddToCart} 
      />
      <h2>Your Cart</h2>
      <Cart 
        cartItems={cartItems} 
        onDecreaseQuantity={(id) => handleCartQuantity(id, 'decrease')} 
        onIncreaseQuantity={(id) => handleCartQuantity(id, 'increase')}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}

// PropTypes validation
CustomerDashboard.propTypes = {
  onSignOut: PropTypes.func.isRequired,
};

export default CustomerDashboard;
