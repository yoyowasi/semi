import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Css/SignUpPage.module.css'; // 스타일 모듈

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (event) => {
        event.preventDefault(); // 폼 제출 시 페이지 리로드 방지
        try {
            // 여기서 회원가입 로직 구현 (API 호출 등)
            console.log("Registering:", email, password, name);
            // 성공 시 로그인 페이지나 다른 페이지로 리디렉션
            navigate('/login');
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. Please try again.");
        }
    };

    return (
        <div className={styles.container}>
            <h1>Sign Up</h1>
            <form onSubmit={handleSignUp}>
                <input
                    className={styles.inputField}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className={styles.inputField}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    className={styles.inputField}
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className={styles.signUpButton} type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUpPage;
