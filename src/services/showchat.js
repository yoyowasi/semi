import React, { useState, useEffect, useRef } from 'react';
import '../Css/scss/chat.scss';
import ChartWithClickablePoints from './ChartWithClickablePoints';

const Showchat = ({
                      // 부모(App)에서 내려주는 실시간(or 정적) 300개 데이터
                      parentData,
                      loading,
                      error,
                      // 실시간 모드 여부
                      isRealTime
                  }) => {
    /**
     * (1) 기존 state들
     */
    const [selectedField, setSelectedField] = useState('oxygenload');
    const [data, setData] = useState([]);  // Showchat이 자체 fetch한 데이터(구간조회 or 초기300개)
    const [average, setAverage] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedPoint, setSelectedPoint] = useState(null);

    // 구간조회용
    const [startId, setStartId] = useState(0);
    const [lastId, setLastId] = useState(0);

    // 드래그스크롤용
    const wrapperRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    /**
     * (2) 이 컴포넌트가 처음 렌더링될 때, /api/data/latest300DataDesc 요청
     */
    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/data/latest300DataDesc`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }
            let fetchedData = await response.json();

            // ** ID 오름차순(작은→큰) 정렬 후에 state 세팅 **
            fetchedData.sort((a, b) => a.id - b.id);
            setData(fetchedData);
        } catch (error) {
            console.error(`Error fetching chart data: ${error.toString()}`);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    /**
     * (3) 구간조회
     */
    const handleFetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/data/${startId}/${lastId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }
            let fetchedData = await response.json();

            // ** ID 오름차순 정렬 후에 setData **
            fetchedData.sort((a, b) => a.id - b.id);
            setData(fetchedData);  // 구간조회 결과로 덮어쓰기
        } catch (err) {
            console.error(`Error fetching chart data: ${err.toString()}`);
        }
    };

    /**
     * (4) 포인트 클릭 핸들러
     */
    const handlePointClick = (clickedData) => {
        console.log('Clicked Data:', clickedData);
        setSelectedData(clickedData);
    };

    /**
     * (5) 드래그 스크롤
     */
    const handleDragStart = (e) => {
        setIsDragging(true);
        setStartX(e.pageX || e.touches[0].pageX);
        setScrollLeft(wrapperRef.current.scrollLeft);
    };
    const handleDrag = (e) => {
        if (!isDragging) return;
        const x = e.pageX || e.touches[0].pageX;
        const walk = (x - startX) * 1.5;
        wrapperRef.current.scrollLeft = scrollLeft - walk;
    };
    const handleDragEnd = () => {
        setIsDragging(false);
    };

    /**
     * (6) 창 크기 대응
     */
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /**
     * (7) 실시간 모드일 때, parentData가 바뀔 때마다 Showchat의 data에도 동기화
     */
    useEffect(() => {
        if (isRealTime) {
            // 실시간 모드인 경우, parentData가 갱신될 때마다 Showchat의 data도 업데이트
            setData(parentData);
        }
        // else면 건드리지 않음(= 구간조회, 초기 fetch데이터 유지)
    }, [parentData, isRealTime]);

    /**
     * (8) 최종적으로 차트에 표시할 데이터
     *    - 실시간 모드면 data와 parentData가 동일하도록 위 useEffect로 동기화 중
     *    - 실시간 모드 Off이면, data는 "구간조회" 또는 "초기 fetch" 결과를 유지
     */
    const finalChartData = data;

    /**
     * (9) 필드 목록
     */
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

    // (부모로부터 받은 loading / error 처리)
    if (loading) {
        return <div>Loading data, please wait...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="data-visualization-container">
            {/* (A) 필드 선택 버튼들 */}
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

            {/* (B) 구간조회 (실시간 Off일 때만 가능) */}
            {!isRealTime && (
                <div className="inputs-container">
                    <label>
                        시작값:
                        <input
                            type="number"
                            value={startId === 0 ? '' : startId}
                            onChange={(e) => {
                                const val = e.target.value;
                                setStartId(val === '' ? 0 : Number(val));
                            }}
                            placeholder="Start ID"
                        />
                    </label>

                    <label>
                        마지막값:
                        <input
                            type="number"
                            value={lastId === 0 ? '' : lastId}
                            onChange={(e) => {
                                const val = e.target.value;
                                setLastId(val === '' ? 0 : Number(val));
                            }}
                            placeholder="Last ID"
                        />
                    </label>

                    <div className="button-container">
                        <button onClick={handleFetchData}>찾기</button>
                    </div>
                </div>
            )}
            {isRealTime && (
                <p style={{ color: 'blue', margin: '10px 0' }}>
                    실시간 모드 활성화 중 (구간 조회 기능 비활성)
                </p>
            )}

            {/* (C) 차트 영역 */}
            <div className="chart-and-average-container">
                <div className="chart-container" style={{ width: chartWidth }}>
                    <ChartWithClickablePoints
                        data={finalChartData}
                        field={selectedField}
                        onBaselineUpdate={setAverage}
                        onPointClick={handlePointClick}
                        width={chartWidth}
                    />
                </div>

                {/* (D) 평균 / 클릭데이터 표시 */}
                <div className="average-text">
                    <p>평균값: {average ? average.toFixed(2) : 'Loading...'}</p>
                    {selectedData && (
                        <div>
                            <h4>클릭한 데이터:</h4>
                            <p><strong>ID:</strong> {selectedData.id}</p>
                            <pre>{JSON.stringify(selectedData, null, 2)}</pre>
                        </div>
                    )}
                    {selectedPoint && (
                        <>
                            <h4>클릭된 데이터:</h4>
                            <p><strong>ID:</strong> {selectedPoint.id}</p>
                            <p><strong>필드값:</strong> {selectedPoint.value}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Showchat;
