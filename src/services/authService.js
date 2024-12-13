import api from 'axios';

// 로그인 함수
export const login = async (username, password) => {
    try {
        const response = await api.post('http://daelim-semiconductor.duckdns.org:8080/login', { email: "youmin302@gmail.com", password: 1234 });
        // 서버 응답에서 토큰 추출
        const { token, message } = response.data;

        // 토큰 저장
        localStorage.setItem('jwtToken', token);

        console.log(message); // "로그인 성공" 메시지 출력
        return token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
    }
};

// 로그아웃 함수
export const logout = () => {
    localStorage.removeItem('jwtToken'); // 로컬 스토리지에서 토큰 제거
};
