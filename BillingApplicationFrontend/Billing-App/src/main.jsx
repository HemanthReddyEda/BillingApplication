// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Update the import
import App from './App';

// Create a root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your app using createRoot
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
