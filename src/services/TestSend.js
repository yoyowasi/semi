import React, { useState, useEffect } from "react";

const App = () => {
    const [message, setMessage] = useState(""); // 서버에서 받은 데이터를 저장

    useEffect(() => {
        // Spring Boot 엔드포인트 호출
        fetch("daelim-semiconductor.duck.org:8080/hello", {
            method: "GET", // GET 요청
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch: " + response.status);
                }
                return response.text(); // 응답 데이터를 텍스트로 변환
            })
            .then((data) => {
                setMessage(data); // 서버 응답을 상태에 저장
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setMessage("Error fetching data"); // 에러 발생 시 표시할 메시지
            });
    }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

    return (
        <div>
            <h1>Server Response</h1>
            <p>{message}</p> {/* 서버 응답을 화면에 표시 */}
        </div>
    );
};

export default App;
