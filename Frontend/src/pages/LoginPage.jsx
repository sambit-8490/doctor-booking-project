import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthForm.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      
      localStorage.setItem('token', response.data.token);
      alert(response.data.message);
      
      navigate('/dashboard'); 
    } catch (error) {
      alert(error.response.data.message || 'Login failed');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {/* Add a link to the registration page */}
      <p className="link-text">
        Don't have an account? <span onClick={() => navigate('/register')} className="link-btn">Register here</span>
      </p>
    </div>
  );
}

export default LoginPage;