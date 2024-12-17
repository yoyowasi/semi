const API_URL = '';

// 예: 로그인 API 호출
export const login = async (username, password) => {
    //const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/auth/login", { //도메인
    const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    const data = await response.json();
    console.log("Server Response:", data);
    localStorage.setItem('token', data.token); // 토큰 저장 키 일관화
    return data.token;
};

export const logout = () => {
    localStorage.removeItem('token'); // 토큰 제거 키 일관화
};

export const register = async (email, password, name) => {
    //const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/user/register", { //도메인
    const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/user/register", { //로컬 호스트
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name}),
    });
    if(!response.ok){
        throw new Error("Failed to register: " + response.status);
    }
};
