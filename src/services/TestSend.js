import React, { useState } from 'react';
import '../Css/scss/select-ID.scss'; // SCSS 스타일시트를 임포트합니다.

function DefectRateChecker() {
    const [fieldName, setFieldName] = useState('');
    const [thresholdPercentage, setThresholdPercentage] = useState('');
    const [defectIds, setDefectIds] = useState([]);
    const [selectedDefectId, setSelectedDefectId] = useState(null);
    const [selectedDefectDetails, setSelectedDefectDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fieldLabels = {
        oxygenload: '산소부하량',
        humidity: '조습',
        windPressure: '송풍압, 풍압',
        windSpeed: '풍구전 속도, 풍구 유속',
        bastingEnergy: '송풍 에너지',
        roadGasFlowVelocity: '노정가스 유속',
        airPermeabilityIndex: '통기저항지수',
        airoutletS1StageVentilationResistanceIndex: '풍구 ~ S1단 통기저항지수',
        s4StageToStreetVentilationResistanceIndex: 'S4단 ~ 노정 통기저항지수',
        pressureDifference: '압력차이',
        pressureLoss: '압력 손실',
        heatFlowRatio: '열류비',
        directReductionConsumptionOfCokes: '직접환원 소모 코크스량',
        frontCombustionZoneDepth: '풍구 앞 연소대 깊이',
        slagBasicity: '슬래그 염기도',
        pciRatePV: 'PCI량 (PV)',
        hotMetaTemperature: '용선 온도',
        previousHotMetalTemperature: '직전 용선온도',
    };

    const fetchDefectRate = async () => {
        if (!fieldName || !thresholdPercentage) {
            alert('필드 이름이나 퍼센티지가 설정되지 않았습니다!!');
            return;
        }

        const validFieldNames = Object.keys(fieldLabels);
        if (!validFieldNames.includes(fieldName)) {
            alert('유효하지 않은 필드 이름입니다.');
            return;
        }

        const percentage = parseFloat(thresholdPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            alert('퍼센티지는 0에서 100 사이의 실수 값을 입력해야 합니다.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            setIsLoading(false);
            return;
        }

        const base64Url = token.split('.')[1];
        const decodedToken = JSON.parse(atob(base64Url));
        if (decodedToken.exp * 1000 < Date.now()) {
            alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const url = `http://localhost:8080/api/data/defectRate?fieldName=${encodeURIComponent(fieldName)}&thresholdPercentage=${encodeURIComponent(percentage)}`;
        console.log('Request URL:', url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Error Response:', errorMessage);
                throw new Error(`Failed to fetch defect rates: ${response.status} - ${errorMessage}`);
            }

            const data = await response.json();
            console.log('Response Data:', data);
            setDefectIds(data);
        } catch (err) {
            console.error('Error fetching defect rates:', err.message);
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIdClick = async (id) => {
        setSelectedDefectId(id);
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        try {
            const url = `http://localhost:8080/api/data/${encodeURIComponent(id)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch defect details: ${response.status} ${response.statusText}`);
            }

            const details = await response.json();
            console.log('Detail Data:', details);
            setSelectedDefectDetails(details);
        } catch (err) {
            console.error('Error fetching defect details:', err.message);
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const chunkArray = (array, size) => {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
            chunkedArr.push(array.slice(i, i + size));
        }
        return chunkedArr;
    };

    const defectIdGroups = chunkArray(defectIds, 5);

    return (
        <div className="data-visualization-container">
            <h1>불량율 확인</h1>
            <select value={fieldName} onChange={e => setFieldName(e.target.value)}>
                <option value="">검색하고싶은 필드 고르기</option>
                {Object.entries(fieldLabels).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                ))}
            </select>
            <input
                type="number"
                placeholder="% 입력"
                value={thresholdPercentage}
                onChange={e => setThresholdPercentage(e.target.value)}
            />
            <button onClick={fetchDefectRate} disabled={isLoading}>
                {isLoading ? 'Loading...' : '불량율 검색'}
            </button>

            {isLoading && <div className="loading-spinner">Loading...</div>}

            {defectIdGroups.map((group, index) => (
                <div key={index} className="id-group">
                    {group.map((id, idx) => (
                        <button key={`${id}-${idx}`} onClick={() => handleIdClick(id)}>
                            ID: {id}
                        </button>
                    ))}
                </div>
            ))}

            {selectedDefectDetails && (
                <div>
                    <h3>클릭한 ID 정보:</h3>
                    <table>
                        <tbody>
                        {Object.entries(selectedDefectDetails).map(([key, value]) => (
                            <tr key={key}>
                                <td>{fieldLabels[key] || key}</td>
                                <td>{value !== null && value !== undefined ? value.toString() : 'N/A'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>
                </div>
            )}
        </div>
    );
}

export default DefectRateChecker;
