import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Showchat from './services/showchat';
import Table from './services/table';
import TestSend from "./services/TestSend";
import LoginPage from './LoginPage';
import SignUpPage from './services/signup'; // 파일 경로 확인 필요

const App = () => {
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loggedIn, setLoggedIn] = useState(localStorage.getItem("token") ? true : false);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Redirecting to login.");
                setLoggedIn(false);
                return;
            }

            const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/data", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();
            setData(result);
            setLoggedIn(true);
        };

        if (loggedIn) {
            fetchData();
        }
    }, [loggedIn]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={loggedIn ? <Navigate replace to="/main" /> : <Navigate replace to="/login" />} />
                <Route path="/login" element={<LoginPage setLoggedIn={setLoggedIn} />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/main" element={
                    <div>
                        <h1>Welcome to the Main Page</h1>
                        <div>
                            <button onClick={() => setActiveComponent('showchat')}>Show Chart</button>
                            <button onClick={() => setActiveComponent('table')}>Show Table</button>
                            <button onClick={() => setActiveComponent('TestSend')}>Test</button>
                        </div>
                        <div style={{ marginTop: "20px" }}>
                            <h2>Server Data:</h2>
                            {error && <p style={{ color: "red" }}>Error: {error}</p>}
                            {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading data...</p>}
                        </div>
                        {activeComponent === 'showchat' && <Showchat />}
                        {activeComponent === 'table' && <Table />}
                        {activeComponent === "TestSend" && <TestSend />}
                    </div>
                } />
            </Routes>
        </Router>
    );
};

export default App;
