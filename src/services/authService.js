import { jwtDecode } from 'jwt-decode';
const API_URL = '';

// 예: 로그인 API 호출
export const login = async (username, password) => {
    //const response = await fetch("http://daelim-semiconductor.duckdns.org:8080/api/auth/login", { //도메인 주소
    const response = await fetch("https://daelim-semiconductor.duckdns.org:8080/api/auth/login", {
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
    const response = await fetch("https://daelim-semiconductor.duckdns.org:8080/api/user/register", { //로컬 호스트
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name}),
    });
    if(!response.ok){
        throw new Error("Failed to register: " + response.status);
    }//
};

export const getIsAdmin = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        console.log("Decoded Token:", decoded);
        console.log("Decoded isAdmin:", decoded.isAdmin);
        return decoded.isAdmin === true; // 토큰에서 isAdmin 값을 확인
    } catch (error) {
        console.error('Failed to decode token:', error);
        return false;
    }
};
