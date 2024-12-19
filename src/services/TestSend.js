import React, { useState } from 'react';

function DefectRateChecker() {
    const [fieldName, setFieldName] = useState('');
    const [thresholdPercentage, setThresholdPercentage] = useState('');
    const [defectIds, setDefectIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fields = [
        { label: '산소부하량', field: 'oxygenload' },
        { label: '조습', field: 'humidity' },
        { label: '송풍압, 풍압', field: 'windPressure' },
        { label: '풍구전 속도, 풍구 유속', field: 'windSpeed' },
        { label: '송풍 에너지', field: 'bastingEnergy' },
        { label: '노정가스 유속', field: 'roadGasFlowVelocity' },
        { label: '통기저항지수', field: 'airPermeabilityIndex' },
        { label: '풍구 ~ S1단 통기저항지수', field: 'airoutletS1StageVentilationResistanceIndex' },
        { label: 'S4단 ~ 노정 통기저항지수', field: 's4StageToStreetVentilationResistanceIndex' },
        { label: '압력차이', field: 'pressureDifference' },
        { label: '압력 손실', field: 'pressureLoss' },
        { label: '열류비', field: 'heatFlowRatio' },
        { label: '직접환원 소모 코크스량', field: 'directReductionConsumptionOfCokes' },
        { label: '풍구 앞 연소대 깊이', field: 'frontCombustionZoneDepth' },
        { label: '슬래그 염기도', field: 'slagBasicity' },
        { label: 'PCI량 (PV)', field: 'pciRatePV' },
        { label: '용선 온도', field: 'hotMetaTemperature' },
        { label: '직전 용선온도', field: 'previousHotMetalTemperature' },
    ];

    const fetchDefectRate = async () => {
        if (!fieldName || !thresholdPercentage) {
            alert('Both field name and threshold percentage are required!');
            return;
        }

        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');  // This assumes you have a valid token stored

        try {
            const url = `http://daelim-semiconductor.duckdns.org:8080/api/data/defectRate?fieldName=${encodeURIComponent(fieldName)}&thresholdPercentage=${encodeURIComponent(thresholdPercentage)}`;
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
            setDefectIds(data);  // Assuming the server returns an array of IDs
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Check Defect Rate</h1>
            <select
                value={fieldName}
                onChange={e => setFieldName(e.target.value)}
            >
                <option value="">Select Field</option>
                {fields.map(field => (
                    <option key={field.field} value={field.field}>{field.label}</option>
                ))}
            </select>
            <input
                type="number"
                placeholder="Enter threshold percentage"
                value={thresholdPercentage}
                onChange={e => setThresholdPercentage(e.target.value)}
            />
            <button onClick={fetchDefectRate} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Fetch Defect Rate'}
            </button>

            {defectIds.length > 0 && (
                <div>
                    <h3>Defect Data IDs:</h3>
                    <ul>
                        {defectIds.map(id => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default DefectRateChecker;
