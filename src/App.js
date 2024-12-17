import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Showchat from './services/showchat';
import Table from './services/table';
import TestSend from './services/TestSend';
import LoginPage from './LoginPage';
import SignUpPage from './services/signup';
import { useAuth } from './contexts/AuthContext';

const App = () => {
    const { user } = useAuth(); // AuthContext에서 상태 가져오기
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // 토큰 확인 및 데이터 가져오기
    const fetchData = async () => {
        const token = localStorage.getItem("token");

        // 토큰 확인
        if (!token) {
            console.error("No token found. Redirecting to login.");
            return;
        }

        // Authorization 헤더 확인용 로그
        console.log("Sending Authorization Header:", `Bearer ${token}`);

        try {
            const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/data", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // 토큰 전송
                    "Content-Type": "application/json",
                },
            });

            // 응답 확인
            if (!response.ok) {
                console.error(`Error ${response.status}: Failed to fetch data`);

                if (response.status === 403) {
                    console.warn("403 Forbidden: Token might be invalid or expired. Checking...");
                    // 서버의 응답 메시지를 확인하고 조건에 따라 토큰을 삭제하도록 처리
                    const errorText = await response.text();
                    console.error("Server response:", errorText);

                    if (errorText.includes("Invalid or expired")) {
                        alert("Access Denied: Invalid or expired token.");
                        localStorage.removeItem("token");
                    }
                }
                return;
            }


            // JSON 데이터 처리
            const result = await response.json();
            console.log("Fetched Data:", result);
            setData(result);
        } catch (err) {
            console.error("Error fetching data:", err.message);
            setError(err.message);
        }
    };


    useEffect(() => {
        if (user.loggedIn) {
            fetchData();
        }
    }, [user.loggedIn]);

    return (
        <Routes>
            <Route
                path="/"
                element={user.loggedIn ? <Navigate replace to="/main" /> : <Navigate replace to="/login" />}
            />
            <Route
                path="/login"
                element={<LoginPage />}
            />
            <Route
                path="/signup"
                element={<SignUpPage />}
            />
            <Route path="/main" element={
                user.loggedIn ? (
                    <div>
                        <h1>Welcome to the Main Page</h1>
                        <div>
                            <button onClick={() => setActiveComponent('showchat')}>Show Chart</button>
                            <button onClick={() => setActiveComponent('table')}>Show Table</button>
                            <button onClick={() => setActiveComponent('TestSend')}>Test</button>
                            <button onClick={() => setActiveComponent('newFeature')}>New Feature</button>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <h2>Server Data:</h2>
                            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                            {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading data...</p>}
                        </div>

                        {activeComponent === 'showchat' && <Showchat />}
                        {activeComponent === 'table' && <Table />}
                        {activeComponent === 'TestSend' && <TestSend />}
                        {activeComponent === 'newFeature' && <div><h2>New Feature Placeholder</h2></div>}
                    </div>
                ) : (
                    <Navigate replace to="/login" />
                )
            } />
        </Routes>
    );
};

export default App;
