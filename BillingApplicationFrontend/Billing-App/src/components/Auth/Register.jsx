import { useState } from 'react';
import { register } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobilenumber: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register(formData);
      navigate('/login');
    } catch (error) {
      console.error("Registration error:", error.response ? error.response.data : error.message);
      // Extract the message from the error response or set a generic message
      const errorMessage = error.response && error.response.data.message 
                           ? error.response.data.message 
                           : "Registration failed. Please check your details and try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="outerRegister">
      <div className="auth-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            placeholder="Email"
            type="email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            placeholder="Mobile Number"
            type="tel"
            onChange={(e) => setFormData({ ...formData, mobilenumber: e.target.value })}
            required
          />
          <input
            placeholder="Password"
            type="password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          >
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button type="submit">Register</button>
        </form>
        {error && <p className="error">{error}</p>} {/* Render only the error message */}
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default Register;

// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

