import React, { useState, useEffect } from 'react';
import '../Css/scss/chat.scss'
import ChartWithClickablePoints from './ChartWithClickablePoints'; // 현재 폴더에 위치

const ShowChart = () => {
    const [selectedField, setSelectedField] = useState('oxygenload');
    const [data, setData] = useState([]);
    const [average, setAverage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth); // 창 너비 상태 추가

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('현재 저장된 토큰:', token);

        const fetchData = async () => {
            try {
                const response = await fetch(`http://daelim-semiconductor.duckdns.org:8080/api/data`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                }

                const fetchedData = await response.json();
                setData(fetchedData);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAverageUpdate = (avg) => {
        console.log('handleAverageUpdate called with:', avg);
        if (avg !== undefined) {
            setAverage(avg);
        } else {
            console.error('handleAverageUpdate received undefined');
        }
    };

    const handlePointClick = (clickedData) => {
        console.log("Clicked Data:", clickedData);
        setSelectedData(clickedData);
    };

    // 차트에서 선택 가능한 다양한 데이터 필드 목록
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

    const chartWidth = windowWidth < 768 ? 300 : 600; // 화면 크기에 따라 차트의 너비를 조정
    const responsiveStyle = {
        position: 'absolute',
        top: windowWidth < 768 ? '110%' : '30%',
        right: windowWidth < 768 ? '5%' : '20%',
        width: windowWidth < 768 ? '90%' : '22%',
        backgroundColor: '#f9f9f9',
        padding: '1%',
        border: '1px solid #ccc',
        borderRadius: '5px',
        textAlign: 'left',
        overflowY: 'auto',
        maxHeight: '300px',
    };

    return (
        <div className="data-visualization-container">
            <div className="buttons-container">
                {fields.map(({ label, field }) => (
                    <button key={field} onClick={() => setSelectedField(field)}>
                        {label}
                    </button>
                ))}
            </div>
            {loading && <div>Loading data, please wait...</div>}
            {error && <div>Error: {error}</div>}
            {!loading && !error && data.length > 0 && (
                <>
                    <div className="chart-and-average-container">
                        <div className="chart-container" style={{ width: chartWidth }}>
                            <ChartWithClickablePoints
                                data={data}
                                field={selectedField}
                                onBaselineUpdate={setAverage}
                                onPointClick={handlePointClick}
                                width={chartWidth} // 차트 컴포넌트에 너비 전달
                            />
                        </div>
                        <div className="average-text">
                            <p>평균값: {average !== null && average !== undefined ? average.toFixed(2) : 'Loading...'}</p>
                            {selectedData && (
                                <div>
                                    <h4>클릭한 데이터:</h4>
                                    <p><strong>ID:</strong> {selectedData.id}</p>
                                    <pre>{JSON.stringify(selectedData, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                    {/*{selectedData && (*/}
                    {/*    <div className="average-text" style={responsiveStyle}>*/}
                    {/*        <h4>클릭한 데이터:</h4>*/}
                    {/*        <p><strong>ID:</strong> {selectedData.id}</p>*/}
                    {/*        <pre>{JSON.stringify(selectedData, null, 2)}</pre>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </>
            )}
        </div>
    );
};

export default ShowChart;
