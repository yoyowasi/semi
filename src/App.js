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
    const [data, setData] = useState([]);         // 차트 데이터
    const dataRef = useRef([]);                   // 최신 데이터 참조
    const [error, setError] = useState(null);     // 에러 상태
    const [isAdmin, setIsAdmin] = useState(false);// 관리자 여부
    const [isRealTime, setIsRealTime] = useState(false); // 실시간 여부
    const [stompClient, setStompClient] = useState(null); // WebSocket 클라이언트
    const [baseline, setBaseline] = useState(0);  // 기준선 상태

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

    // 데이터 로드 (로그인 상태일 때만)
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

    // WebSocket 설정 (실시간 데이터)
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

                    // 구독
                    client.subscribe('/topic/latest', (message) => {
                        try {
                            const newData = JSON.parse(message.body);
                            console.log('Received Data:', newData);

                            // 백엔드에서 배열 형태로 보낸다고 가정
                            if (Array.isArray(newData)) {
                                // 기존 데이터 + 새 데이터 합치기
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
            // 실시간 모드가 꺼진 경우: 기존 WebSocket 종료
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
        }

        // 언마운트 시 정리
        return () => {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
        };
    }, [isRealTime]);

    return (
        <div>
            {/* 로그인되어 있다면 로그아웃 버튼 */}
            {user.loggedIn && (
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <button onClick={handleLogout} style={{ padding: '10px 15px', cursor: 'pointer' }}>
                        Logout
                    </button>
                </div>
            )}

            <Routes>
                {/* 루트 경로 */}
                <Route
                    path='/'
                    element={
                        <Navigate
                            replace
                            to={user.loggedIn ? '/main' : '/login'}
                        />
                    }
                />

                {/* 로그인 페이지 */}
                <Route
                    path='/login'
                    element={
                        user.loggedIn ? (
                            <Navigate replace to='/main' />
                        ) : (
                            <LoginPage />
                        )
                    }
                />

                {/* 회원가입 페이지 */}
                <Route path='/signup' element={<SignUpPage />} />

                {/* 메인 페이지 */}
                <Route
                    path='/main'
                    element={
                        user.loggedIn ? (
                            <div>
                                <h1>반도체 관리 시스템</h1>

                                {/* 상단 버튼들 */}
                                <div>
                                    <button onClick={() => setActiveComponent('showchat')}>
                                        차트 보기
                                    </button>
                                    <button onClick={() => setActiveComponent('table')}>
                                        테이블 보기
                                    </button>
                                    <button onClick={() => setActiveComponent('TestSend')}>
                                        불량률 체크
                                    </button>

                                    {/* 실시간 시작 / 종료 버튼 분리 */}
                                    <button onClick={() => setIsRealTime(true)}>
                                        실시간 시작
                                    </button>
                                    <button onClick={() => setIsRealTime(false)}>
                                        실시간 종료
                                    </button>

                                    {isAdmin && (
                                        <button onClick={() => setActiveComponent('AdminPage')}>
                                            관리자 페이지
                                        </button>
                                    )}
                                </div>

                                {/* 액티브 컴포넌트 렌더링 */}
                                {activeComponent === 'showchat' && (
                                    <>
                                        {/* 기존 Showchat 컴포넌트 */}
                                        <Showchat />

                                        {/* 실시간 모드일 때만 차트 표시 */}
                                        {isRealTime && (
                                            <ChartWithClickablePoints
                                                data={data}
                                                field='value'
                                                onBaselineUpdate={(avg) => setBaseline(avg)}
                                                onPointClick={(point) =>
                                                    console.log('Point clicked:', point)
                                                }
                                            />
                                        )}
                                    </>
                                )}

                                {activeComponent === 'table' && <Table />}

                                {activeComponent === 'TestSend' && <TestSend />}

                                {activeComponent === 'AdminPage' && <AdminPage />}
                            </div>
                        ) : (
                            <Navigate replace to='/login' />
                        )
                    }
                />
            </Routes>
        </div>
    );
};

export default App;
