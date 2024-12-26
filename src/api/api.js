import axios from 'axios';

const api = axios.create({
    //baseURL: 'http://daelim-semiconductor.duckdns.org:8080', // 서버 주소
    baseURL: 'http://localhost:8080', // 서버 주소
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터로 JWT 토큰 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
