import { useState } from 'react';
import { login } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './login.css';

function Login({ setRole }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true
    setErrorMessage(''); // Clear previous error messages

    try {
      const response = await login(formData);
      console.log('Login response:', response.data); // Debugging line
      
      const { role, id, customerId } = response.data; // Extract role, user ID, and customer ID

      if (role) {
        setRole(role);
        localStorage.setItem('userRole', role); // Save role in local storage
        localStorage.setItem('userId', id); // Save user ID in local storage
        if (customerId) { // Check if customer ID exists in the response
          localStorage.setItem('customerId', customerId); // Save customer ID in local storage
          console.log('Customer ID stored:', localStorage.getItem('customerId')); // Debugging line
        }
        navigate('/dashboard'); // Redirect to the dashboard
      }
    } catch (error) {
      // Check if error response exists and has data
      const message = error.response?.data?.message || 'Invalid username or password.';
      setErrorMessage(message);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className='outerWindow'>
      <div className='loginDetails'>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            value={formData.username} // Bind the input value to state
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={formData.password} // Bind the input value to state
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
          <button type="submit" disabled={isLoading}>Login</button> {/* Disable button if loading */}
        </form>
        <p>
          New user? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

// PropTypes validation
Login.propTypes = {
  setRole: PropTypes.func.isRequired,
};

export default Login;
