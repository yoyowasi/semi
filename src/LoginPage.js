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
            const token = await login(username, password); // 서버 요청
            console.log("Token received:", token); // 토큰 값 확인

            if (token) {
                console.log("Saving token to localStorage...");
                localStorage.setItem("token", token); // 토큰 저장
                console.log("Token saved:", localStorage.getItem("token")); // 저장된 토큰 확인
                auth.setUser({ loggedIn: true }); // 상태 업데이트
                navigate('/'); // 메인 화면으로 이동
            }
        } catch (error) {
            console.error("Login failed:", error.message);
            alert("Login failed. Please check your credentials.");
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
