import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import CustomerDashboard from './components/Dashboard/CustomerDashboard';
import Login from './components/Auth/Login';
import ProductList from './components/Product/ProductList';
import Cart from './components/Product/Cart';
import Payment from './components/Payments/Payment';

function App() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || ''); // Retrieve role from localStorage
  const [cartItems, setCartItems] = useState([]); // State to manage cart items

  // Set role in localStorage whenever it changes
  useEffect(() => {
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole'); // Clear role from localStorage if empty
    }
  }, [role]);

  // SignOut Function
  const handleSignOut = () => {
    setRole(''); // Clear role from state
    localStorage.removeItem('userRole'); // Clear role from localStorage
    localStorage.removeItem('userId'); // Clear userId from localStorage if you store it there
    // Optionally clear cart items
    setCartItems([]);
  };

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      const updatedCart = cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleDecreaseQuantity = (productId) => {
    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      const updatedCart = cartItems.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCartItems(updatedCart);
    } else {
      handleRemoveFromCart(productId);
    }
  };

  const handleIncreaseQuantity = (productId) => {
    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
      const updatedCart = cartItems.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(updatedCart);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setRole={setRole} />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={role === 'ADMIN' ? <AdminDashboard onSignOut={handleSignOut} /> : role === 'CUSTOMER' ? <CustomerDashboard onSignOut={handleSignOut} /> : <Navigate to="/login" />}
        />

        {/* Product List and Cart for Customers */}
        <Route
          path="/products"
          element={role ? <ProductList role={role} onAddToCart={handleAddToCart} /> : <Navigate to="/login" />}
        />
        <Route
          path="/cart"
          element={role ? (
            <Cart 
              cartItems={cartItems} 
              onRemoveItem={handleRemoveFromCart} 
              onDecreaseQuantity={handleDecreaseQuantity}
              onIncreaseQuantity={handleIncreaseQuantity}
            />
          ) : <Navigate to="/login" />}
        />
        <Route
          path="/payment"
          element={role ? <Payment /> : <Navigate to="/login" />}
        />

        {/* Fallback for unmatched routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;