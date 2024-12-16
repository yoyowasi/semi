import React, { useState, useEffect } from 'react';
import Showchat from './services/showchat';
import Table from './services/table';
import TestSend from "./services/TestSend";

const App = () => {
    const [activeComponent, setActiveComponent] = useState('showchat'); // 기본값
    const [data, setData] = useState(null); // 서버 데이터 상태
    const [error, setError] = useState(null); // 오류 상태

    // 서버에서 데이터를 가져오는 함수
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token"); // 토큰 가져오기
                if (!token) throw new Error("No token found. Please login.");

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
                setData(result); // 성공적으로 가져온 데이터 저장
            } catch (err) {
                setError(err.message);
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []); // 컴포넌트 마운트 시 실행

    return (
        <div>
            <h1>Welcome to the Main Page</h1>
            <div>
                <button onClick={() => setActiveComponent('showchat')}>Show Chart</button>
                <button onClick={() => setActiveComponent('table')}>Show Table</button>
                <button onClick={() => setActiveComponent('TestSend')}>Test</button>
            </div>

            {/* 서버에서 가져온 데이터 표시 */}
            <div style={{ marginTop: "20px" }}>
                <h2>Server Data:</h2>
                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                {data ? (
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                ) : (
                    <p>Loading data...</p>
                )}
            </div>

            {/* 조건부 렌더링 */}
            {activeComponent === 'showchat' && <Showchat />}
            {activeComponent === 'table' && <Table />}
            {activeComponent === "TestSend" && <TestSend />}
        </div>
    );
};

export default App;
