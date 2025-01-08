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
import './Css/App.css';

// ---- (기존 코드에서) 추가로 쓰이던 차트 컴포넌트 ----
// import ChartWithClickablePoints from './services/ChartWithClickablePoints'; // 필요없는 차트는 제거

const App = () => {
    const { user, setUser } = useAuth();

    // ----------------- 상태 정의 ----------------- //
    const [activeComponent, setActiveComponent] = useState('showchat');
    const [data, setData] = useState([]);      // "실시간 OR 정적 300개"를 저장
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isRealTime, setIsRealTime] = useState(false);
    const [stompClient, setStompClient] = useState(null);
    const [loading, setLoading] = useState(false);

    // 예시로만 쓰였던 baseline, 제거해도 기능적으로 문제 없음
    // const [baseline, setBaseline] = useState(0);

    // ----------------- 로그아웃 로직 ----------------- //
    const handleLogout = () => {
        if (stompClient) {
            stompClient.deactivate();
        }
        logout();
        setUser({ loggedIn: false });
        localStorage.removeItem("token");
    };

    // ----------------- 정적 데이터(fetch) 가져오기 ----------------- //
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found. Redirecting to login.");
            return;
        }

        try {
            setLoading(true);
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

            let result = await response.json();
            // 뒤에서 300개만 잘라서 세팅
            let sliced = result.slice(-300);

            // ** ID 오름차순 정렬 후에 setData **
            sliced.sort((a, b) => a.id - b.id);
            setData(sliced);
        } catch (err) {
            console.error("Fetch Error:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ----------------- 토큰 검증 ----------------- //
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

    // ----------------- 로그인 시 데이터 fetch ----------------- //
    useEffect(() => {
        if (user.loggedIn) {
            fetchData();
        }
    }, [user.loggedIn]);

    // ----------------- 관리자 여부 확인 ----------------- //
    useEffect(() => {
        const adminStatus = getIsAdmin();
        setIsAdmin(adminStatus);
    }, [user.loggedIn]);

    // ----------------- WebSocket 설정 (실시간) ----------------- //
    useEffect(() => {
        // 실시간 모드 Off => 연결 해제
        if (!isRealTime) {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
            return;
        }

        // 실시간 모드 On => 연결 시도
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token available for WebSocket connection.");
            return;
        }

        const client = new Client({
            brokerURL: `ws://daelim-semiconductor.duckdns.org:8080/websocket?token=${token}`,
            onConnect: () => {
                console.log("WebSocket 연결 성공");

                // 실시간 데이터 구독
                client.subscribe('/topic/latest', (message) => {
                    let newData = JSON.parse(message.body);

                    // 뒤에서 300개만 자르고, ID 오름차순 정렬
                    newData.sort((a, b) => a.id - b.id);
                    const sliced = newData.slice(-300);

                    console.log("Real-time incoming data:", sliced);

                    // 실시간 최신 데이터로 교체
                    setData(sliced);
                });
            },
            onStompError: (frame) => {
                console.error("STOMP 오류:", frame.headers["message"]);
            },
        });

        client.activate();
        setStompClient(client);

        // 언마운트(또는 isRealTime=false) 시 연결 해제
        return () => {
            if (client) {
                client.deactivate();
            }
            setStompClient(null);
        };
    }, [isRealTime]);

    return (
        <div>
            {/* (1) 헤더 영역 (로그인 시에만 노출) */}
            {user.loggedIn && (
                <header className="header">
                    <div className="header-left">
                        <div className="title">반도체 관리 시스템</div>
                        <button
                            className={`real-time-button ${isRealTime ? 'active' : ''}`}
                            onClick={() => setIsRealTime(!isRealTime)}
                        >
                            {isRealTime ? '실시간 종료' : '실시간 시작'}
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

            {/* (2) 라우팅 설정 */}
            <Routes>
                <Route
                    path="/"
                    element={<Navigate replace to={user.loggedIn ? "/main" : "/login"} />}
                />
                <Route
                    path="/login"
                    element={user.loggedIn ? <Navigate replace to="/main"/> : <LoginPage/>}
                />
                <Route path="/signup" element={<SignUpPage/>} />

                <Route
                    path="/main"
                    element={
                        user.loggedIn ? (
                            <div>
                                {/* (A) showchat */}
                                {activeComponent === 'showchat' && (
                                    <Showchat
                                        parentData={data}       // 부모의 "실시간(또는 정적)" 데이터
                                        loading={loading}
                                        error={error}
                                        isRealTime={isRealTime}
                                    />
                                )}

                                {/* (B) table */}
                                {activeComponent === 'table' && <Table />}

                                {/* (C) TestSend */}
                                {activeComponent === 'TestSend' && <TestSend />}

                                {/* (D) AdminPage */}
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
                        user.loggedIn && isAdmin ? (
                            <AdminPage/>
                        ) : (
                            <Navigate replace to="/main"/>
                        )
                    }
                />
            </Routes>
        </div>
    );
};

export default App;
