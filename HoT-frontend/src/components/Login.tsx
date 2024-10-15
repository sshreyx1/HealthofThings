import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/hot.png';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Check the credentials
        if (username === 'admin' && password === 'admin') {
            // Set a token in local storage
            localStorage.setItem('authToken', 'dummy_token');
            localStorage.setItem('username', username);
            navigate('/dashboard'); // Redirect to dashboard on successful login
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo-section">
                    <img src={logo} alt="Health of Things Logo" className="login-logo" />
                </div>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>
                    <div className="login-form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>
                    <button type="submit" className="login-button">
                        LOGIN
                    </button>
                </form>
                <p className="login-signup-text">
                    Don't have an account? <a href="#">Sign Up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;