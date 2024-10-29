import { useState } from 'react';
import { login } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Auth.css';

function Login({ setRole }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      const { role, id } = response.data; // Assuming response.data contains role and user ID

      if (role) {
        setRole(role);
        localStorage.setItem('userRole', role); // Save role in local storage
        localStorage.setItem('userId', id); // Save user ID in local storage
        navigate('/dashboard'); // Redirect to the dashboard
      }
    } catch (error) {
      setErrorMessage('Invalid username or password.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        New user? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

// PropTypes validation
Login.propTypes = {
  setRole: PropTypes.func.isRequired,
};

export default Login;
