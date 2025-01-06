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
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './Css/App.css';

const App = () => {
    const { user, setUser } = useAuth();
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isRealTime, setIsRealTime] = useState(false);
    const [stompClient, setStompClient] = useState(null);

    const handleLogout = () => {
        if (stompClient) {
            stompClient.deactivate();
        }
        logout();
        setUser({ loggedIn: false });
        localStorage.removeItem("token");
    };

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found. Redirecting to login.");
            return;
        }

        try {
            const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/data", {
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

    useEffect(() => {
        if (!isRealTime || stompClient) return;

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token available for WebSocket connection.");
            return;
        }

        const client = new Client({
            brokerURL: `ws://daelim-semiconductor.duckdns.org:8080/websocket?token=${token}`,
            onConnect: () => {
                console.log("WebSocket 연결 성공");

                // WebSocket 연결 성공 시 메시지 전송 테스트
                client.publish({
                    destination: "/app/message",
                    body: JSON.stringify({ message: "Hello, WebSocket!" }),
                });
            },
            onStompError: (frame) => {
                console.error("STOMP 오류:", frame.headers["message"]);
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client) client.deactivate();
            setStompClient(null);
        };
    }, [isRealTime]);



    return (
        <div>
            {user.loggedIn && (
                <header className="header">
                    <div className="header-left">
                        <div className="title">반도체 관리 시스템</div>
                        <button
                            className={`real-time-button ${isRealTime ? 'active' : ''}`}
                            onClick={() => setIsRealTime(!isRealTime)}
                        >
                            {isRealTime ? '실시간 종료' : '실시간 꺼짐'}
                        </button>
                    </div>

                    <div className="header-middle">
                        <button
                            className={`menu-button ${activeComponent === 'showchat' ? 'active' : ''}`}
                            onClick={() => setActiveComponent('showchat')}
                        >
                            차트 보기
                        </button>
                        <button
                            className={`menu-button ${activeComponent === 'TestSend' ? 'active' : ''}`}
                            onClick={() => setActiveComponent('TestSend')}
                        >
                            불량률 체크
                        </button>
                        <button
                            className={`menu-button ${activeComponent === 'table' ? 'active' : ''}`}
                            onClick={() => setActiveComponent('table')}
                        >
                            테이블 보기
                        </button>
                        {isAdmin && (
                            <button
                                className={`menu-button ${activeComponent === 'AdminPage' ? 'active' : ''}`}
                                onClick={() => setActiveComponent('AdminPage')}
                            >
                                관리자 페이지
                            </button>
                        )}
                    </div>

                    <div className="header-right">
                        <button onClick={handleLogout} className="logout-button">로그아웃</button>
                    </div>
                </header>
            )}

            <Routes>
                <Route path="/" element={<Navigate replace to={user.loggedIn ? "/main" : "/login"}/>}/>
                <Route path="/login" element={user.loggedIn ? <Navigate replace to="/main"/> : <LoginPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/main" element={user.loggedIn ? (
                    <div>
                        {activeComponent === 'showchat' && <Showchat/>}
                        {activeComponent === 'table' && <Table/>}
                        {activeComponent === 'TestSend' && <TestSend/>}
                        {activeComponent === 'AdminPage' && <AdminPage/>}
                    </div>
                ) : <Navigate replace to="/login"/>}/>
                <Route path="/admin"
                       element={user.loggedIn && isAdmin ? <AdminPage/> : <Navigate replace to="/main"/>}/>
            </Routes>
        </div>
    );
};//

export default App;
