import React, { useState, useEffect } from 'react';
import ChartComponent from '../chart.js';  // ChartComponent 모듈을 import합니다. 실제 경로는 확인 필요
// import '../ProcessedData.json';  // JSON 파일로부터 데이터를 가져옴. 경로는 파일 위치에 맞게 조정 필요
import '../Css/Text.css'
import ChartWithClickablePoints from './ChartWithClickablePoints'; // 현재 폴더에 위치


const ShowChart = () => {
    const [selectedField, setSelectedField] = useState('oxygenload');  // 선택된 데이터 필드의 상태를 관리 (초기값: 'oxygenload')
    const [data, setData] = useState([]);  // 차트에 표시될 데이터의 상태
    const [average, setAverage] = useState(null);
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState(null);  // 에러 상태
    const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {
        // 토큰 값 로깅
        const token = localStorage.getItem('token');
        console.log('현재 저장된 토큰:', token);

        // API 요청
        fetch("http://localhost:8080/api/data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('데이터:', data);
            })
            .catch(error => {
                console.error('에러 발생:', error);
            });
    }, []);
    // 컴포넌트 마운트 후 로컬 데이터 파일로부터 데이터를 불러와 상태를 설정
    // useEffect(() => {
    //     fetch("http://localhost:8080/api/data") // API 주소 변경
    //         .then((response) => {
    //             if (!response.ok) {
    //                 throw new Error(`Failed to fetch data: ${response.status}`);
    //             }
    //             return response.json(); // JSON 형식의 응답을 파싱
    //         })
    //         .then((fetchedData) => {
    //             setData(fetchedData); // 데이터 상태 업데이트
    //             setLoading(false); // 로딩 완료
    //         })
    //         .catch((error) => {
    //             console.error("Error fetching data:", error);
    //             setError(error.message);
    //             setLoading(false); // 로딩 상태 종료
    //         });
    // }, []); // 빈 의존성 배열은 컴포넌트 마운트 시 한 번만 실행됨

    const handleAverageUpdate = (avg) => {
        console.log('handleAverageUpdate called with:', avg);
        if (avg !== undefined) {
            setAverage(avg);
        } else {
            console.error('handleAverageUpdate received undefined');
        }
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
    const handlePointClick = (clickedData) => {
        console.log("Clicked Data:", clickedData);
        setSelectedData(clickedData);
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
                        <div className="chart-container">
                            <ChartWithClickablePoints
                                data={data}
                                field={selectedField}
                                onBaselineUpdate={handleAverageUpdate}
                                onPointClick={handlePointClick}
                            />
                        </div>
                        <div className="average-text">
                            <p>평균값: {average !== null && average !== undefined ? average.toFixed(2) : 'Loading...'}</p>
                        </div>
                    </div>
                    {selectedData && (
                        <div className="selected-data">
                            <h4>클릭한 데이터:</h4>
                            <p><strong>ID:</strong> {selectedData.id}</p>
                            <p><strong>Field Value:</strong> {selectedData[selectedField]}</p>

                            <p><strong>Additional Info:</strong> {JSON.stringify(selectedData)}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );


};

export default ShowChart;  // 컴포넌트를 export 하여 다른 파일에서 사용할 수 있도록 함


// import React, { useState, useEffect } from 'react';
// import ChartComponent from '../chart.js'; // 차트 컴포넌트 파일명 확인 및 오타 수정
//
// const ShowChart = () => {
//     const [selectedField, setSelectedField] = useState('oxygenload'); // 초기 선택 필드
//     const [data, setData] = useState([]); // 데이터를 저장할 상태
//     const [loading, setLoading] = useState(true); // 로딩 상태
//     const [error, setError] = useState(null); // 에러 상태
//
//     // 데이터 가져오기
//     useEffect(() => {
//         fetch("http://daelim-semiconductor.duckdns.org:8080/api/data") // API 주소 변경
//             .then((response) => {
//                 if (!response.ok) {
//                     throw new Error(`Failed to fetch data: ${response.status}`);
//                 }
//                 return response.json(); // JSON 형식의 응답을 파싱
//             })
//             .then((fetchedData) => {
//                 setData(fetchedData); // 데이터 상태 업데이트
//                 setLoading(false); // 로딩 완료
//             })
//             .catch((error) => {
//                 console.error("Error fetching data:", error);
//                 setError(error.message);
//                 setLoading(false); // 로딩 상태 종료
//             });
//     }, []); // 빈 의존성 배열은 컴포넌트 마운트 시 한 번만 실행됨
//
//     // 데이터 필드와 버튼 레이블을 매핑
//     const fields = [
//         { label: '산소부하량', field: 'oxygenload' },
//         { label: '조습', field: 'humidity' },
//         { label: '송풍압, 풍압', field: 'windPressure' },
//         { label: '풍구전 속도, 풍구 유속', field: 'windSpeed' },
//         { label: '송풍 에너지', field: 'bastingEnergy' },
//         { label: '노정가스 유속', field: 'roadGasFlowVelocity' },
//         { label: '통기저항지수', field: 'airPermeabilityIndex' },
//         { label: '풍구 ~ S1단 통기저항지수', field: 'airoutletS1StageVentilationResistanceIndex' },
//         { label: 'S4단 ~ 노정 통기저항지수', field: 's4StageToStreetVentilationResistanceIndex' },
//         { label: '압력차이', field: 'pressureDifference' },
//         { label: '압력 손실', field: 'pressureLoss' },
//         { label: '열류비', field: 'heatFlowRatio' },
//         { label: '직접환원 소모 코크스량', field: 'directReductionConsumptionOfCokes' },
//         { label: '풍구 앞 연소대 깊이', field: 'frontCombustionZoneDepth' },
//         { label: '슬래그 염기도', field: 'slagBasicity' },
//         { label: 'PCI량 (PV)', field: 'pciRatePV' },
//         { label: '용선 온도', field: 'hotMetaTemperature' },
//         { label: '직전 용선온도', field: 'previousHotMetalTemperature' },
//     ];
//
//     if (loading) {
//         return <p>Loading...</p>; // 로딩 중 표시
//     }
//
//     if (error) {
//         return <p>Error: {error}</p>; // 에러 메시지 표시
//     }
//
//     return (
//         <div>
//             <div>
//                 {fields.map(({ label, field }) => (
//                     <button key={field} onClick={() => setSelectedField(field)}>
//                         {label}
//                     </button>
//                 ))}
//             </div>
//             <ChartComponent data={data} field={selectedField} />
//         </div>
//     );
// };
//
// export default ShowChart;
