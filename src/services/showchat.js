import React, { useState, useEffect, useRef } from 'react';
import '../Css/scss/chat.scss';
import ChartWithClickablePoints from './ChartWithClickablePoints';

const ShowChart = ({}) => {
    const [selectedField, setSelectedField] = useState('oxygenload');
    const [data, setData] = useState([]);
    const [average, setAverage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedPoint, setSelectedPoint] = useState(null);

    // 추가된 state: startId, limit
    const [startId, setStartId] = useState(0); // startId 기본값은 0
    const [lastId, setLastId] = useState(300);   // limit 기본값은 300

    const wrapperRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // 창 크기 조절 핸들러
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 초기 데이터를 가져오는 함수
    const fetchInitialData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://daelim-semiconductor.duckdns.org:8080/api/data/${startId}/${lastId}`, {
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

    // 초기 데이터 로딩 (컴포넌트가 처음 렌더링될 때 한 번만 실행)
    useEffect(() => {
        fetchInitialData();
    }, []); // 빈 배열로 설정하여 한 번만 실행

    const handleFetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://daelim-semiconductor.duckdns.org:8080/api/data/${startId}/${lastId}`, {
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

    // 포인트 클릭 핸들러
    const handlePointClick = clickedData => {
        console.log('Clicked Data:', clickedData);
        setSelectedData(clickedData);
    };

    if (loading) {
        return <div>Loading data, please wait...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }

    // 드래그 기능 추가
    const handleDragStart = (e) => {
        setIsDragging(true);
        setStartX(e.pageX || e.touches[0].pageX);
        setScrollLeft(wrapperRef.current.scrollLeft);
    };

    const handleDrag = (e) => {
        if (!isDragging) return;
        const x = e.pageX || e.touches[0].pageX;
        const walk = (x - startX) * 1.5; // 드래그 속도 조절
        wrapperRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // 필드 목록
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
            {/* Tabs Container */}
            <div
                className={`buttons-container ${isDragging ? 'dragging' : ''}`}
                ref={wrapperRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDrag}
                onTouchEnd={handleDragEnd}
            >
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

            {/* Start ID와 Limit 입력 필드 추가 */}
            <div className="inputs-container">
                <input
                    type="number"
                    value={startId}
                    onChange={(e) => setStartId(Number(e.target.value))}
                    placeholder="Start ID"
                />
                <input
                    type="number"
                    value={lastId}
                    onChange={(e) => setLastId(Number(e.target.value))}
                    placeholder="Last ID"
                />
                {/* 갱신 버튼 */}
                <button onClick={handleFetchData}>갱신</button>
            </div>

            {/* Data Display */}
            {loading ? (
                <div>Loading data, please wait...</div>
            ) : error ? (
                <div>Error: {error}</div>
            ) : (
                <div className="chart-and-average-container">
                    {/* Chart Section */}
                    <div className="chart-container" style={{ width: chartWidth }}>
                        <ChartWithClickablePoints
                            data={data}
                            field={selectedField}
                            onBaselineUpdate={setAverage}
                            onPointClick={handlePointClick}
                            width={chartWidth}
                        />
                    </div>

                    {/* Average Section */}
                    <div className="average-text">
                        <p>평균값: {average ? average.toFixed(2) : 'Loading...'}</p>
                        {selectedData && (
                            <div>
                                <h4>클릭한 데이터:</h4>
                                <p><strong>ID:</strong> {selectedData.id}</p>
                                <pre>{JSON.stringify(selectedData, null, 2)}</pre>
                            </div>
                        )}
                        {/* 추가 정보 섹션 */}
                        {selectedPoint && (
                            <>
                                <h4>클릭된 데이터:</h4>
                                <p><strong>ID:</strong> {selectedPoint.id}</p>
                                <p><strong>필드값:</strong> {selectedPoint.value}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
);
};

export default ShowChart;

