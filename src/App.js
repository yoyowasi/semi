import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Showchat from './services/showchat';
import Table from './services/table';
import TestSend from './services/TestSend';
import LoginPage from './LoginPage';
import SignUpPage from './services/signup';
import AdminPage from './services/AdminPage';
import { useAuth } from './contexts/AuthContext';
import { getIsAdmin } from './services/authService';

const App = () => {
    const { user } = useAuth(); // AuthContext에서 상태 가져오기
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // 토큰 확인 및 데이터 가져오기
    const fetchData = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found. Redirecting to login.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/data", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: Failed to fetch data`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error("Fetch Error:", err.message);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (user.loggedIn) {
            fetchData();
        }
    }, [user.loggedIn]);

    useEffect(() => {
        const adminStatus = getIsAdmin();
        setIsAdmin(adminStatus);
    }, [user.loggedIn]);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    user.loggedIn ? <Navigate replace to="/main" /> : <Navigate replace to="/login" />
                }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
                path="/main"
                element={
                    user.loggedIn ? (
                        <div>
                            <h1>Welcome to the Main Page</h1>
                            <div>
                                <button onClick={() => setActiveComponent('showchat')}>Show Chart</button>
                                <button onClick={() => setActiveComponent('table')}>Show Table</button>
                                <button onClick={() => setActiveComponent('TestSend')}>Test</button>
                                {isAdmin && (
                                    <button onClick={() => setActiveComponent('AdminPage')}>Admin Page</button>
                                )}
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <h2>Server Data:</h2>
                                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                                {data ? (
                                    <p>Data successfully fetched.</p>
                                ) : (
                                    <p>Loading data...</p>
                                )}
                            </div>

                            {/* Active component rendering */}
                            {activeComponent === 'showchat' && <Showchat />}
                            {activeComponent === 'table' && <Table />}
                            {activeComponent === 'TestSend' && <TestSend />}
                            {activeComponent === 'AdminPage' && <AdminPage />}
                        </div>
                    ) : (
                        <Navigate replace to="/login" />
                    )
                }
            />
            <Route
                path="/admin"
                element={
                    user.loggedIn && isAdmin ? <AdminPage /> : <Navigate replace to="/main" />
                }
            />
        </Routes>
    );
};

export default App;
