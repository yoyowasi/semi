import React, { useState, useEffect } from 'react';
import '../Css/scss/chat.scss';
import ChartWithClickablePoints from './ChartWithClickablePoints';

const ShowChart = () => {
    const [selectedField, setSelectedField] = useState('oxygenload');
    const [data, setData] = useState([]);
    const [average, setAverage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:8080/api/data', {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
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
    }, []);

    const handlePointClick = clickedData => {
        console.log("Clicked Data:", clickedData);
        setSelectedData(clickedData);
    };

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
        { label: '직전 용선온도', field: 'previousHotMetalTemperature' }
    ];

    const chartWidth = windowWidth < 768 ? 300 : 600;

    return (
        <div className="data-visualization-container">
            <div className="buttons-container">
                {fields.map(({ label, field }) => (
                    <button key={field} onClick={() => setSelectedField(field)} className="button">
                        {label}
                    </button>
                ))}
            </div>
            {loading ? <div>Loading data, please wait...</div> : error ? <div>Error: {error}</div> : (
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
                    <div className="average-text">
                        <p>평균값: {average ? average.toFixed(2) : 'Loading...'}</p>
                        {selectedData && (
                            <div>
                                <h4>클릭한 데이터:</h4>
                                <p><strong>ID:</strong> {selectedData.id}</p>
                                <pre>{JSON.stringify(selectedData, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowChart;
