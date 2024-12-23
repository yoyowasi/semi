import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './services/authService';
import { useAuth } from './contexts/AuthContext';
import styles from './Css/LoginPage.module.css'; // CSS 모듈 임포트

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
            alert("로그인 실패!! 아이디나 비밀번호가 다릅니다!!");
        }
    };
    // LoginPage.js의 handleRegister 함수 수정
    const handleRegister = () => {
        navigate('/signup'); // 절대 경로로 수정
    };
    return (
        <div className={styles.loginContainer}>
            <img src="/대림대%20로고.png" alt="대림대 로고" className={styles.logo}/>
            <h1>Login</h1>
            <input
                className={styles.inputField}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                className={styles.inputField}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className={styles.loginButton} onClick={handleLogin}>로그인</button>
            <button className={styles.signUpButton} onClick={handleRegister}>회원가입</button>
        </div>
    );
};

export default LoginPage;