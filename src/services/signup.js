import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Css/SignUpPage.module.css';
import { register } from '../services/authService'; // register 함수 임포트 확인

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate(); // navigate 훅 사용


    const handleSignUp = async (event) => {
        event.preventDefault();
        try {
            console.log("Attempting to register with:", email, password, name);

            // register 함수 호출
            const responseMessage = await register(email, password, name);
            console.log("Registration response:", responseMessage);

            alert("Registration successful! Redirecting to login...");
            navigate('/login'); // 로그인 페이지로 이동
        } catch (error) {
            console.error("Registration failed:", error.message);
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
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className={styles.inputField}
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    className={styles.inputField}
                    type="name"
                    placeholder="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className={styles.signUpButton} type="submit">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignUpPage;
