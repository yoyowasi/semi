import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './services/authService';
import { useAuth } from './contexts/AuthContext.js';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const token = await login(username, password);
            if (token) {
                if (auth.setUser) {
                    auth.setUser({ loggedIn: true });
                }
                navigate('/protected');
            }
        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <div>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default LoginPage;
