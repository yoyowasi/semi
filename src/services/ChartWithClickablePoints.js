import React, { useEffect, useState } from 'react';
import {LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Scatter, ResponsiveContainer} from 'recharts';
import '../Css/scss/chat.scss';

// 숫자 포맷터 함수
const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`; // 백만 단위
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;       // 천 단위
    if (Number.isInteger(num)) return num;                       // 정수면 그대로
    return num.toFixed(2);                                       // 소수점 둘째 자리
};

const calculateTicks = (startId, endId) => {
    // 시작 값과 종료 값 정렬
    if (startId > endId) [startId, endId] = [endId, startId];

    const range = endId - startId;
    const maxTicks = 20; // 최대 Tick 개수
    let step = Math.ceil(range / maxTicks); // 기본 간격 계산

    // step 값을 항상 5의 배수로 강제
    step = Math.ceil(step / 5) * 5;

    // 시작점을 step의 배수로 정렬
    const startTick = Math.floor(startId / step) * step;

    // Ticks 배열 생성
    const ticks = [];
    for (let i = startTick; i <= endId; i += step) {
        ticks.push(i);
    }

    return ticks;
};





const filterData = (data, maxPoints) => {
    if (!data || data.length <= maxPoints) {
        return data; // 데이터가 충분히 적으면 그대로 반환
    }

    const step = Math.ceil(data.length / maxPoints); // 샘플링 간격 계산
    return data.filter((_, index) => index % step === 0); // 샘플링
};

// 메인 차트 컴포넌트
const ChartWithClickablePoints = ({ data, field, onBaselineUpdate, onPointClick}) => {
    const [avg, setAvg] = useState(0);
    const [aboveRangePoints, setAboveRangePoints] = useState([]);
    const [belowRangePoints, setBelowRangePoints] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null); // 선택한 데이터 저장
    const [verticalLines, setVerticalLines] = useState([]); // 세로선 저장

    useEffect(() => {
        if (!data || data.length === 0) return;

        const total = data.reduce((acc, item) => acc + (item[field] || 0), 0);
        const average = total / data.length;
        setAvg(average);

        // 상계 및 하계 초과 데이터 분리
        const range = average * 0.1;
        const above = data.filter(item => item[field] > average + range)
            .map(item => ({ id: item.id, value: item[field] }));
        const below = data.filter(item => item[field] < average - range)
            .map(item => ({ id: item.id, value: item[field] }));

        setAboveRangePoints(above);
        setBelowRangePoints(below);

        // 부모로 평균값 전달
        if (onBaselineUpdate && typeof onBaselineUpdate === 'function') {
            onBaselineUpdate(average);
        }
    }, [data, field, onBaselineUpdate]);

    // 평균값 ±10% 범위를 기준으로 Y축 범위를 결정
    const yRange = avg * 0.1;
    const yMin = Math.min(...data.map(item => item[field] || 0), avg - yRange * 2);
    const yMax = Math.max(...data.map(item => item[field] || 0), avg + yRange * 2);

    // 필터링된 데이터 사용
    const filteredData = filterData(data, 100);

    const startId = filteredData[0]?.id || 0;
    const endId = filteredData[filteredData.length - 1]?.id || 1000;
    const ticks = calculateTicks(startId, endId);

    const [selectedPointId, setSelectedPointId] = useState(null);

    const handleButtonClick = (point) => {
        setVerticalLines((prevLines) => {
            const existingLine = prevLines.find((line) => line.id === point.id);
            if (existingLine) {
                // 이미 존재하면 visible 상태를 토글
                return prevLines.map((line) =>
                    line.id === point.id ? { ...line, visible: !line.visible } : line
                );
            }
            // 새로운 세로선 추가 (상계/하계 구분 포함)
            const isAbove = aboveRangePoints.some((p) => p.id === point.id);
            return [...prevLines, { id: point.id, visible: true, color: isAbove ? 'red' : 'blue' }];
        });
        if (onPointClick) onPointClick(point);
    };


    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={data.map((item) => ({ ...item, avg }))}
                    onClick={(e) => {
                        if (onPointClick && e && e.activePayload) {
                            onPointClick(e.activePayload[0].payload);
                        }
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" ticks={ticks} tickFormatter={(value) => value} />
                    <YAxis domain={[yMin, yMax]} tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip />
                    <ReferenceLine y={avg + yRange} stroke="#FF5733" strokeDasharray="4 4" label="Avg +10%" />
                    <ReferenceLine y={avg - yRange} stroke="#3498DB" strokeDasharray="4 4" label="Avg -10%" />
                    <ReferenceLine y={avg} stroke="#2ECC71" strokeWidth={2} label="Avg" />
                    <Line type="linear" dataKey={field} stroke="#01DFD7" strokeWidth={3} dot={false} />
                    <Scatter data={aboveRangePoints} fill="red" shape="circle" name="Above Range" />
                    <Scatter data={belowRangePoints} fill="blue" shape="circle" name="Below Range" />
                    {verticalLines
                        .filter((line) => line.visible)
                        .map((line) => (
                            <ReferenceLine
                                key={`vertical-${line.id}`}
                                x={line.id}
                                stroke={line.color}
                                strokeWidth={2}
                                label={{
                                    value: `ID: ${line.id}`,
                                    position: 'bottom',
                                    fill: line.color,
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    dy: 20,
                                }}
                            />
                        ))}
                </LineChart>
            </ResponsiveContainer>
            <div className="chart-buttons">
                <h4>상계 10% 초과 데이터</h4>
                {aboveRangePoints.map((point) => (
                    <button
                        key={point.id}
                        className={`up-button ${
                            verticalLines.some((line) => line.id === point.id && line.visible) ? 'active' : ''
                        }`}
                        onClick={() => handleButtonClick(point)}
                    >
                        ID: {point.id}
                    </button>
                ))}
                <h4>하계 10% 미만 데이터</h4>
                {belowRangePoints.map((point) => (
                    <button
                        key={point.id}
                        className={`down-button ${
                            verticalLines.some((line) => line.id === point.id && line.visible) ? 'active' : ''
                        }`}
                        onClick={() => handleButtonClick(point)}
                    >
                        ID: {point.id}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChartWithClickablePoints;
