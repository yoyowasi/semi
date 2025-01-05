import React, { useState, useEffect, useRef } from 'react';
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
import ChartWithClickablePoints from './services/ChartWithClickablePoints';

const App = () => {
    const { user, setUser } = useAuth();
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState([]); // 차트 데이터
    const dataRef = useRef([]); // 최신 데이터 참조
    const [error, setError] = useState(null); // 에러 상태
    const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부
    const [isRealTime, setIsRealTime] = useState(false); // 실시간 여부
    const [stompClient, setStompClient] = useState(null); // WebSocket 클라이언트
    const [baseline, setBaseline] = useState(0); // 기준선 상태

    // 로그아웃
    const handleLogout = () => {
        if (stompClient) {
            stompClient.deactivate();
        }
        logout();
        setUser({ loggedIn: false });
        localStorage.removeItem('token');
    };

    // 일반 데이터 불러오기
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found. Redirecting to login.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/data', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: Failed to fetch data`);
            }

            const result = await response.json();
            setData(result);
            dataRef.current = result;
        } catch (err) {
            console.error('Fetch Error:', err.message);
            setError(err.message);
        }
    };

    // 토큰 검증
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:8080/validate-token', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    if (response.ok) {
                        setUser({ loggedIn: true });
                    } else {
                        localStorage.removeItem('token');
                        setUser({ loggedIn: false });
                    }
                })
                .catch(err => {
                    console.error('Token validation failed:', err);
                    localStorage.removeItem('token');
                    setUser({ loggedIn: false });
                });
        } else {
            setUser({ loggedIn: false });
        }
    }, [setUser]);

    // 데이터 로드
    useEffect(() => {
        if (user.loggedIn) {
            fetchData();
        }
    }, [user.loggedIn]);

    // 관리자 권한 확인
    useEffect(() => {
        const adminStatus = getIsAdmin();
        setIsAdmin(adminStatus);
    }, [user.loggedIn]);

    // WebSocket 설정
    useEffect(() => {
        if (isRealTime) {
            const token = localStorage.getItem('token');

            const client = new Client({
                brokerURL: `ws://localhost:8080/websocket?token=${token}`,
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                debug: (str) => console.log('WebSocket Debug:', str),
                onConnect: () => {
                    console.log('WebSocket 연결 성공');
                    client.subscribe('/topic/latest', (message) => {
                        try {
                            const newData = JSON.parse(message.body);
                            console.log('Received Data:', newData);

                            if (Array.isArray(newData)) {
                                setData((prevData) => [...prevData, ...newData]);
                            } else {
                                console.error('Invalid Data Format:', newData);
                            }
                        } catch (err) {
                            console.error('Data Parsing Error:', err);
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error('STOMP 오류:', frame.headers['message']);
                },
                onDisconnect: () => {
                    console.log('WebSocket 연결 해제');
                },
            });

            client.activate();
            setStompClient(client);
        } else {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
        }

        return () => {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
        };
    }, [isRealTime]);

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
                <Route path='/' element={<Navigate replace to={user.loggedIn ? '/main' : '/login'} />} />
                <Route path='/login' element={user.loggedIn ? <Navigate replace to='/main' /> : <LoginPage />} />
                <Route path='/signup' element={<SignUpPage />} />
                <Route
                    path='/main'
                    element={user.loggedIn ? (
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
                            {isRealTime && (
                                <ChartWithClickablePoints
                                    data={data}
                                    field='value'
                                    onBaselineUpdate={(avg) => setBaseline(avg)}
                                    onPointClick={(point) => console.log('Point clicked:', point)}
                                />
                            )}
                            {activeComponent === 'AdminPage' && <AdminPage />}
                        </div>
                    ) : (
                        <Navigate replace to='/login' />
                    )}
                />
            </Routes>
        </div>
    );
};

export default App;
