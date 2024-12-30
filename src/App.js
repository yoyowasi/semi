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

const App = () => {
    const { user, setUser } = useAuth();
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isRealTime, setIsRealTime] = useState(false); // 실시간 차트 여부
    const [stompClient, setStompClient] = useState(null); // 웹소켓 클라이언트

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

    // 웹소켓 클라이언트 초기화
    useEffect(() => {
        if (isRealTime && !stompClient) {
            const socket = new SockJS('http://daelim-semiconductor.duckdns.org:8080/websocket', null, {
                transports: ['websocket', 'xhr-streaming', 'xhr-polling'], // 전송 방식 설정
            });const client = new Client({
                webSocketFactory: () => socket, // SockJS를 웹소켓 팩토리로 전달
                connectHeaders: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Authorization 헤더 추가
                },
                onConnect: () => {
                    console.log("Connected to WebSocket");
                    client.subscribe("/topic/latest", (message) => {
                        const newData = JSON.parse(message.body);
                        setData((prevData) => [...prevData.slice(1), newData]); // 새로운 데이터로 상태 업데이트
                    });
                },
                onStompError: (frame) => {
                    console.error('STOMP error', frame);
                }
            });

            setStompClient(client);
            client.activate();  // 웹소켓 연결
        } else if (!isRealTime && stompClient) {
            stompClient.deactivate();
            setStompClient(null);
        }

        // 클린업 함수 (컴포넌트 언마운트 시 연결 해제)
        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [isRealTime, stompClient]); // stompClient 의존성 제거

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
                            <button onClick={() => setIsRealTime(!isRealTime)}>
                                {isRealTime ? '실시간 종료' : '실시간 시작'}
                            </button>
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
