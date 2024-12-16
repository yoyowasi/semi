import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Showchat from './services/showchat';
import Table from './services/table';
import TestSend from './services/TestSend';
import LoginPage from './LoginPage';
import SignUpPage from './services/signup';

const App = () => {
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token")); // 초기 상태 설정

    // 토큰 확인 및 데이터 가져오기
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found. Redirecting to login.");
            setLoggedIn(false);
            return;
        }

        console.log("Sending Authorization Header:", `Bearer ${token}`);

        try {
            const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/data", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error(`Error ${response.status}: Failed to fetch data`);
                if (response.status === 403) {
                    alert("Access Denied: Invalid or expired token.");
                    localStorage.removeItem("token");
                    setLoggedIn(false);
                }
                return;
            }

            // Check if the response has a body
            const text = await response.text(); // Read response as plain text
            if (!text) {
                console.error("Empty response body.");
                setError("Empty response body.");
                return;
            }

            try {
                const result = JSON.parse(text); // Parse the text as JSON
                console.log("Fetched Data:", result);
                setData(result);
            } catch (err) {
                console.error("Failed to parse JSON:", err.message);
                setError("Failed to parse JSON response.");
            }
        } catch (err) {
            console.error("Error fetching data:", err.message);
            setError(err.message);
        }
    };


    // useEffect를 사용하여 fetchData 호출
    useEffect(() => {
        if (loggedIn) {
            fetchData();
        }
    }, [loggedIn]);

    return (
        <Routes>
            {/* Root Route */}
            <Route
                path="/"
                element={loggedIn ? <Navigate replace to="/main" /> : <Navigate replace to="/login" />}
            />

            {/* Login Route */}
            <Route
                path="/login"
                element={<LoginPage setLoggedIn={setLoggedIn} />}
            />

            {/* Sign Up Route */}
            <Route
                path="/signup"
                element={<SignUpPage />}
            />

            {/* Main Route */}
            <Route path="/main" element={
                loggedIn ? (
                    <div>
                        <h1>Welcome to the Main Page</h1>
                        {/* Buttons for Active Components */}
                        <div>
                            <button onClick={() => setActiveComponent('showchat')}>Show Chart</button>
                            <button onClick={() => setActiveComponent('table')}>Show Table</button>
                            <button onClick={() => setActiveComponent('TestSend')}>Test</button>
                            <button onClick={() => setActiveComponent('newFeature')}>New Feature</button>
                        </div>

                        {/* Server Data */}
                        <div style={{ marginTop: '20px' }}>
                            <h2>Server Data:</h2>
                            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                            {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading data...</p>}
                        </div>

                        {/* Conditional Component Rendering */}
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
