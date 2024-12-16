const API_URL = '';

// 예: 로그인 API 호출
export const login = async (username, password) => {
    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // 반드시 설정
            },
            body: JSON.stringify({ username, password }), // 올바른 JSON 형식
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        const data = await response.json();
        console.log("Login Success:", data);
    } catch (error) {
        console.error("Login Error:", error);
    }
};



// 로그아웃 함수
export const logout = () => {
    localStorage.removeItem('jwtToken'); // 로컬 스토리지에서 토큰 제거
};
