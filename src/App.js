import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Showchat from './services/showchat';
import Table from './services/table';
import TestSend from './services/TestSend';
import LoginPage from './LoginPage';
import SignUpPage from './services/signup';
import AdminPage from './services/AdminPage';
import { useAuth } from './contexts/AuthContext';
import { getIsAdmin, logout } from './services/authService';

const App = () => {
    const { user, setUser } = useAuth();
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const handleLogout = () => {
        logout();
        setUser({ loggedIn: false });
    };

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found. Redirecting to login.");
            return;
        }

        try {
            const response = await fetch("https://daelim-semiconductor.duckdns.org:8443/api/data", {
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
        const token = localStorage.getItem("token");
        if (token) {
            fetch("/validate-token", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    if (response.ok) {
                        setUser({ loggedIn: true });
                    } else {
                        localStorage.removeItem("token");
                        setUser({ loggedIn: false });
                    }
                })
                .catch(err => {
                    console.error("Token validation failed:", err);
                    localStorage.removeItem("token");
                    setUser({ loggedIn: false });
                });
        } else {
            setUser({ loggedIn: false });
        }
    }, [setUser]);

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
        <div>
            {user.loggedIn && (
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <button onClick={handleLogout} style={{ padding: '10px 15px', cursor: 'pointer' }}>
                        Logout
                    </button>
                </div>
            )}

            <Routes>
                <Route path="/" element={<Navigate replace to={user.loggedIn ? "/main" : "/login"} />} />
                <Route path="/login" element={user.loggedIn ? <Navigate replace to="/main" /> : <LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/main" element={user.loggedIn ? (
                    <div>
                        <h1>반도체 관리 시스템</h1>
                        <div>
                            <button onClick={() => setActiveComponent('showchat')}>차트 보기</button>
                            <button onClick={() => setActiveComponent('table')}>테이블 보기</button>
                            <button onClick={() => setActiveComponent('TestSend')}>불량률 체크</button>
                            {isAdmin && (
                                <button onClick={() => setActiveComponent('AdminPage')}>관리자 페이지</button>
                            )}
                        </div>
                        {activeComponent === 'showchat' && <Showchat />}
                        {activeComponent === 'table' && <Table />}
                        {activeComponent === 'TestSend' && <TestSend />}
                        {activeComponent === 'AdminPage' && <AdminPage />}
                    </div>
                ) : <Navigate replace to="/login" />} />
                <Route path="/admin" element={user.loggedIn && isAdmin ? <AdminPage /> : <Navigate replace to="/main" />} />
            </Routes>
        </div>
    );
};

export default App;
