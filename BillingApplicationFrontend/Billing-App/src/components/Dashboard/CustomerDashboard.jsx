import { useState, useEffect } from 'react';
import ProductList from '../Product/ProductList';
import Cart from '../Product/Cart';
import { getProducts, updateCustomerProfile, getCustomerProfile } from '../../services/api';
import './CustomerDashboard.css';
import { FaEdit, FaSignOutAlt, FaSave, FaCog } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';

function CustomerDashboard({ onSignOut }) {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Failed to load products. Please try again.');
            }
        };

        const fetchUserProfile = async () => {
            if (userId) {
                try {
                    const response = await getCustomerProfile(userId);
                    setUser(response.data);
                    setEditedUser(response.data || { name: '', email: '', password: '' });
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    toast.error('Failed to load user profile. Please try again.');
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
        setCartItems(prevCartItems => {
            return prevCartItems.map(item => {
                if (item.id === productId) {
                    const newQuantity = operation === 'increase' ? item.quantity + 1 : item.quantity - 1;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);
        });
    };

    const handleRemoveItem = (productId) => {
        setCartItems(prevCartItems => prevCartItems.filter(item => item.id !== productId));
    };

    const handleEditProfile = () => {
        setIsEditing(prev => !prev);
        if (!isEditing && user) {
            setEditedUser({ ...user, password: '' }); // Reset password field on edit toggle
            setError('');
        }
    };

    const handleSaveProfile = async () => {
        if (!userId) {
            setError("User ID is missing.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!editedUser.name || !editedUser.email || !editedUser.password) {
            setError("Name, Email, and Password cannot be empty.");
            return;
        } else if (!emailRegex.test(editedUser.email)) {
            setError("Invalid email format.");
            return;
        } else if (editedUser.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        try {
            await updateCustomerProfile(userId, editedUser);
            setUser({ ...editedUser, password: undefined }); // Avoid storing the password in the user state
            setIsEditing(false);
            setError('');
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("Error updating profile. Please try again.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    return (
        <div className="customer-dashboard">
            <ToastContainer />
            <nav className="navbar">
                <h2>Welcome to Your Dashboard, {user ? user.name : 'Customer'}!</h2>
                <div className="navbar-actions">
                    <div className="settings-menu" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                        <FaCog className="icon settings-icon" />
                        {isSettingsOpen && (
                            <div className="dropdown-menu">
                                <div onClick={handleEditProfile} className="dropdown-item">
                                    <FaEdit className="icon" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </div>
                                <div onClick={onSignOut} className="dropdown-item">
                                    <FaSignOutAlt className="icon" /> Sign Out
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            {error && <div className="error-message">{error}</div>}
            {isEditing ? (
                <div className="edit-profile-form">
                    <h2>Edit Profile</h2>
                    <label>Name</label>
                    <input type="text" name="name" value={editedUser.name} onChange={handleChange} />
                    <label>Email</label>
                    <input type="email" name="email" value={editedUser.email} onChange={handleChange} />
                    <label>Password</label>
                    <input type="password" name="password" value={editedUser.password} onChange={handleChange} />
                    <button className="save-profile-button" onClick={handleSaveProfile}>
                        <FaSave /> Save
                    </button>
                </div>
            ) : (
                user && <></>
            )}
            <div className="dashboard-actions">
                <h2>Products</h2>
            </div>
            <ProductList products={products} onAddToCart={handleAddToCart} role={user?.role || 'customer'} />
            <h2>Your Cart</h2>
            <Cart
                cartItems={cartItems}
                onIncreaseQuantity={(id) => handleCartQuantity(id, 'increase')}
                onDecreaseQuantity={(id) => handleCartQuantity(id, 'decrease')}
                onRemoveItem={handleRemoveItem}
            />
        </div>
    );
}

CustomerDashboard.propTypes = {
    onSignOut: PropTypes.func.isRequired,
};

export default CustomerDashboard;
