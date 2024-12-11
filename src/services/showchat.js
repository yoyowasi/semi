import React, { useState, useEffect } from 'react';
import ChartComponent from '../chart.js'; // 차트 컴포넌트 파일명 확인 및 오타 수정

const ShowChart = () => {
    const [selectedField, setSelectedField] = useState('oxygenload'); // 초기 선택 필드
    const [data, setData] = useState([]); // 데이터를 저장할 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // 데이터 가져오기
    useEffect(() => {
        fetch("http://daelim-semiconductor.duckdns.org:8080/api/data") // API 주소 변경
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }
                return response.json(); // JSON 형식의 응답을 파싱
            })
            .then((fetchedData) => {
                setData(fetchedData); // 데이터 상태 업데이트
                setLoading(false); // 로딩 완료
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setError(error.message);
                setLoading(false); // 로딩 상태 종료
            });
    }, []); // 빈 의존성 배열은 컴포넌트 마운트 시 한 번만 실행됨

    // 데이터 필드와 버튼 레이블을 매핑
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

    if (loading) {
        return <p>Loading...</p>; // 로딩 중 표시
    }

    if (error) {
        return <p>Error: {error}</p>; // 에러 메시지 표시
    }

    return (
        <div>
            <div>
                {fields.map(({ label, field }) => (
                    <button key={field} onClick={() => setSelectedField(field)}>
                        {label}
                    </button>
                ))}
            </div>
            <ChartComponent data={data} field={selectedField} />
        </div>
    );
};

export default ShowChart;
