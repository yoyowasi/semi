import React, { useState } from 'react';

function QualityCheck() {
    const [defectRate, setDefectRate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDefectRate = async () => {
        setIsLoading(true);
        setError(null);

        // 로컬 스토리지에서 토큰 가져오기
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:8080/api/data/defectRate', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // 토큰을 Authorization 헤더에 포함
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch defect rate: ${response.status}`);
            }

            const data = await response.json();
            setDefectRate(data.defectRate); // API 응답에 따라 조정 필요
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button onClick={fetchDefectRate} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Check Defect Rate'}
            </button>
            {defectRate !== null && <p>Defect Rate: {defectRate}%</p>}
            {error && <p>{error}</p>}
        </div>
    );
}

export default QualityCheck;
