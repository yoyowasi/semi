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
            alert('필드 이름이나 퍼센테이지가 설정 되지않았습니다!!');
            return;
        }
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        try {
            //const url = `http://daelim-semiconductor.duckdns.org:8080/api/data/defectRate?fieldName=${encodeURIComponent(fieldName)}&thresholdPercentage=${encodeURIComponent(thresholdPercentage)}`;
            const url = `http://localhost:8080/api/data/defectRate?fieldName=${encodeURIComponent(fieldName)}&thresholdPercentage=${encodeURIComponent(thresholdPercentage)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch defect rates: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setDefectIds(data);
        } catch (err) {
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
            //const url = `http://daelim-semiconductor.duckdns.org:8080/api/data/${encodeURIComponent(id)}`;
            const url = `http://localhost:8080/api/data/${encodeURIComponent(id)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch defect details: ${response.status} ${response.statusText}`);
            }

            const details = await response.json();
            setSelectedDefectDetails(details);
        } catch (err) {
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

            {defectIdGroups.map((group, index) => (
                <div key={index} className="id-group">
                    {group.map(id => (
                        <button key={id} onClick={() => handleIdClick(id)}>
                            ID: {id}
                        </button>
                    ))}
                </div>
            ))}

            {selectedDefectDetails && (
                <div>
                    <h3>클릭한 id정보:</h3>
                    <table>
                        <tbody>
                        {Object.entries(selectedDefectDetails).map(([key, value]) => (
                            <tr key={key}>
                                <td>{fieldLabels[key] || key}</td>
                                <td>{value.toString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default DefectRateChecker;
