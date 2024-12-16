import api from './api';

// 로그인 함수
export const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        const { token } = response.data; // 백엔드에서 받은 JWT 토큰
        localStorage.setItem('jwtToken', token); // 토큰을 로컬 스토리지에 저장
        return token;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};
//
// 로그아웃 함수
export const logout = () => {
    localStorage.removeItem('jwtToken'); // 로컬 스토리지에서 토큰 제거
};
