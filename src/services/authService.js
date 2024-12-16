const API_URL = '';

// 예: 로그인 API 호출
export const login = async (username, password) => {
    const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    const data = await response.json();
    console.log("Server Response:", data); // 서버에서 반환된 데이터 확인
    return data.token; // token 필드 반환
};




// 로그아웃 함수
export const logout = () => {
    localStorage.removeItem('jwtToken'); // 로컬 스토리지에서 토큰 제거
};
