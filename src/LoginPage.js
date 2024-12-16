import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './services/authService';
import { useAuth } from './contexts/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const auth = useAuth();

    const handleLogin = async () => {
        try {
            const token = await login(username, password);
            if (token) {
                console.log("Login successful, token:", token); // 디버깅용 로그
                auth.setUser({ loggedIn: true });
                localStorage.setItem('token', token);
                navigate('/'); // 메인 화면으로 이동
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Login failed');
        }
    };



    return (
        <div>
            <h1>Login</h1>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default LoginPage;
