import React, { useEffect, useState } from 'react';
import api from '../api/api'; // Axios 인스턴스

const ShowChat = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        api.get('/api/data') // 백엔드 컨트롤러에 요청
            .then((response) => {
                setData(response.data); // 응답 데이터를 상태로 저장
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div>
            <h1>Data:</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default ShowChat;
