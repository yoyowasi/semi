const API_URL = 'http://daelim-semiconductor.duckdns.org:8080/api';

// 예: 로그인 API 호출
export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};


// 로그아웃 함수
export const logout = () => {
    localStorage.removeItem('jwtToken'); // 로컬 스토리지에서 토큰 제거
};
