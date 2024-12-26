import React, { useState, useEffect } from 'react';
import '../Css/scss/chat.scss';
import ChartWithClickablePoints from './ChartWithClickablePoints';

const ShowChart = () => {
    const [selectedField, setSelectedField] = useState('oxygenload');
    const [data, setData] = useState([]);
    const [average, setAverage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedData, setSelectedData] = useState(null); // 클릭한 데이터 상태
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // 불량률 관련 상태
    const [defectRateData, setDefectRateData] = useState(null);
    const [aiPredictedDefectRate, setAiPredictedDefectRate] = useState(null); // AI 예측 불량률
    const [thresholdPercentage] = useState(10.0); // 고정 10%

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 📊 차트 데이터(fetch)
    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:8080/api/data', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }
                const fetchedData = await response.json();
                setData(fetchedData);
                setError(null);
            } catch (error) {
                setError(`Error fetching chart data: ${error.toString()}`);
            } finally {
                setLoading(false);
            }
        };
        fetchChartData();
    }, [selectedField]); // 🚀 selectedField 변경 시 차트 데이터 새로고침

    // 📊 현재 불량률 + 추후 불량률(fetch)
    useEffect(() => {
        const fetchDefectRate = async () => {
            try {
                const url = `http://localhost:5000/predict_defect_rate_300?fieldName=${selectedField}&thresholdPercentage=${thresholdPercentage}`;
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`Failed to fetch defect rate data: ${res.status}`);
                }
                const result = await res.json();
                setDefectRateData(result);
            } catch (err) {
                console.error('Error fetching defect rate data:', err);
                setDefectRateData(null);
            }
        };

        const fetchAiPredictedDefectRate = async () => {
            try {

                const res = await fetch('http://localhost:5000/predict_defect_rate_ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        oxygenload: selectedField === 'oxygenload' ? 32953 : 32000,
                        humidity: selectedField === 'humidity' ? 9.98 : 9.0,
                        windPressure: selectedField === 'windPressure' ? 4051 : 3950,
                        windSpeed: selectedField === 'windSpeed' ? 265 : 266,
                        bastingEnergy: selectedField === 'bastingEnergy' ? 14428 : 13500,
                        roadGasFlowVelocity: selectedField === 'roadGasFlowVelocity' ? 0.81 : 0.85,
                        airPermeabilityIndex: selectedField === 'airPermeabilityIndex' ? 1.974 : 2.0,
                        airoutletS1StageVentilationResistanceIndex: selectedField === 'airoutletS1StageVentilationResistanceIndex' ? 1.324 : 1.45,
                        s4StageToStreetVentilationResistanceIndex: selectedField === 's4StageToStreetVentilationResistanceIndex' ? 0.467 : 0.44,
                        pressureDifference: selectedField === 'pressureDifference' ? 1616 : 1700,
                        pressureLoss: selectedField === 'pressureLoss' ? 0.222 : 0.21,
                        heatFlowRatio: selectedField === 'heatFlowRatio' ? 1.01 : 0.99,
                        directReductionConsumptionOfCokes: selectedField === 'directReductionConsumptionOfCokes' ? 105.7 : 108.9,
                        frontCombustionZoneDepth: selectedField === 'frontCombustionZoneDepth' ? 2.21 : 2.15,
                        slagBasicity: selectedField === 'slagBasicity' ? 1.233 : 1.258,
                        pciRatePV: selectedField === 'pciRatePV' ? 91.2 : 92.1,
                        hotMetaTemperature: selectedField === 'hotMetaTemperature' ? 1490 : 1502,
                        previousHotMetalTemperature: selectedField === 'previousHotMetalTemperature' ? 1502 : 1490
                    })
                });
                if (!res.ok) {
                    throw new Error(`Failed to fetch AI predicted defect rate: ${res.status}`);
                }
                const result = await res.json();
                setAiPredictedDefectRate(result.predictedDefectRate);
            } catch (err) {
                console.error('Error fetching AI predicted defect rate:', err);
                setAiPredictedDefectRate(null);
            }
        };



        if (selectedField) {
            fetchDefectRate();
            fetchAiPredictedDefectRate();
        }
    }, [selectedField, thresholdPercentage]);

    const handlePointClick = clickedData => {
        console.log("Clicked Data:", clickedData);
        setSelectedData(clickedData); // 클릭한 데이터 저장
    };

    // 📌 필드 목록
    const fields = [
        { label: '산소부하량', field: 'oxygenload' },
        { label: '조습', field: 'humidity' },
        { label: '송풍압, 풍압', field: 'windPressure' },
        { label: '풍구 유속', field: 'windSpeed' },
        { label: '송풍 에너지', field: 'bastingEnergy' },
        { label: '노정가스 유속', field: 'roadGasFlowVelocity' },
        { label: '통기저항지수', field: 'airPermeabilityIndex' },
        { label: '풍구~S1단 통기저항지수', field: 'airoutletS1StageVentilationResistanceIndex' },
        { label: 'S4단~노정 통기저항지수', field: 's4StageToStreetVentilationResistanceIndex' },
        { label: '압력차이', field: 'pressureDifference' },
        { label: '압력 손실', field: 'pressureLoss' },
        { label: '열류비', field: 'heatFlowRatio' },
        { label: '직접환원 소모 코크스량', field: 'directReductionConsumptionOfCokes' },
        { label: '풍구 앞 연소대 깊이', field: 'frontCombustionZoneDepth' },
        { label: '슬래그 염기도', field: 'slagBasicity' },
        { label: 'PCI량 (PV)', field: 'pciRatePV' },
        { label: '용선 온도', field: 'hotMetaTemperature' },
        { label: '직전 용선온도', field: 'previousHotMetalTemperature' }
    ];

    const chartWidth = windowWidth < 768 ? 300 : 600;

    return (
        <div className="data-visualization-container">
            {/* 🔘 필드 선택 버튼 */}
            <div className="buttons-container">
                {fields.map(({ label, field }) => (
                    <button
                        key={field}
                        onClick={() => setSelectedField(field)}
                        className={`button ${selectedField === field ? 'active' : ''}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* 📊 차트 및 데이터 */}
            {loading ? (
                <div>Loading data, please wait...</div>
            ) : error ? (
                <div>Error: {error}</div>
            ) : (
                <div className="chart-and-average-container">
                    <div className="chart-container" style={{ width: chartWidth }}>
                        <ChartWithClickablePoints
                            data={data}
                            field={selectedField}
                            onBaselineUpdate={setAverage}
                            onPointClick={handlePointClick}
                            width={chartWidth}
                        />
                    </div>

                    {/* 📊 평균값 */}
                    <div className="average-text">
                        <p>평균값: {average ? average.toFixed(2) : 'Loading...'}</p>
                        {/* 📌 클릭한 데이터 */}
                        {selectedData && (
                            <div>
                                <h4>클릭한 데이터:</h4>
                                <pre>{JSON.stringify(selectedData, null, 2)}</pre>
                            </div>
                        )}
                        {/* 📊 불량률 정보 */}
                        {/* 📊 불량률 정보 */}
                        {defectRateData && (
                            <div style={{ marginTop: '20px' }}>
                                <h4>불량률 정보</h4>
                                <p>
                                    현재 불량률: {defectRateData.defectRate !== undefined && defectRateData.defectRate !== null
                                    ? defectRateData.defectRate.toFixed(2)
                                    : 'Loading...'}%
                                </p>
                                <p>
                                    예측 추후 불량률: {defectRateData.defectRate !== undefined && defectRateData.defectRate !== null
                                    ? (defectRateData.defectRate * 1.1).toFixed(2)
                                    : 'Loading...'}%
                                </p>
                                <p>
                                    AI 예측 불량률: {aiPredictedDefectRate !== null && aiPredictedDefectRate !== undefined && !isNaN(Number(aiPredictedDefectRate))
                                    ? <strong>{Number(aiPredictedDefectRate).toFixed(2)}%</strong>
                                    : <span style={{ color: 'red' }}>Loading...</span>}
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowChart;
