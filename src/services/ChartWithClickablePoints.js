import React, { useEffect, useState } from 'react';
import { LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Scatter } from 'recharts';
import '../Css/scss/chat.scss';

// 숫자 포맷터 함수
const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`; // 백만 단위
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;       // 천 단위
    if (Number.isInteger(num)) return num;                       // 정수면 그대로
    return num.toFixed(2);                                       // 소수점 둘째 자리
};

// 메인 차트 컴포넌트
const ChartWithClickablePoints = ({ data, field, onBaselineUpdate, onPointClick, width = 800, height = 400 }) => {
    const [avg, setAvg] = useState(0);
    const [aboveRangePoints, setAboveRangePoints] = useState([]);
    const [belowRangePoints, setBelowRangePoints] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null); // 선택한 데이터 저장

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

    return (
        <div className="chart-container">
            {/* 차트 */}
            <LineChart
                width={width}
                height={height}
                data={data.map(item => ({ ...item, avg }))}
                onClick={(e) => {
                    if (onPointClick && e && e.activePayload) {
                        onPointClick(e.activePayload[0].payload);
                    }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="id"
                    tickFormatter={value => formatNumber(value)}
                />
                <YAxis
                    domain={[yMin, yMax]}
                    tickFormatter={value => formatNumber(value)}
                />
                <Tooltip />
                <ReferenceLine y={avg + yRange} stroke="#FF5733" strokeDasharray="4 4" label="Avg +10%" />
                <ReferenceLine y={avg - yRange} stroke="#3498DB" strokeDasharray="4 4" label="Avg -10%" />
                <ReferenceLine y={avg} stroke="#2ECC71" strokeWidth={2} label="Avg" />
                <Line
                    type="linear"
                    dataKey={field}
                    stroke="#01DFD7"
                    strokeWidth={3}
                    dot={false}
                />
                <Scatter
                    data={aboveRangePoints}
                    fill="red"
                    shape="circle"
                    name="Above Range"
                />
                <Scatter
                    data={belowRangePoints}
                    fill="blue"
                    shape="circle"
                    name="Below Range"
                />
            </LineChart>

            {/* 범위를 벗어난 데이터 버튼 */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <h4>상계 10% 초과 데이터</h4>
                {aboveRangePoints.map(point => (
                    <button
                        key={point.id}
                        style={{
                            margin: '5px',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#ffecec',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            setSelectedPoint({ id: point.id, value: point.value });
                            if (onPointClick) onPointClick({ id: point.id, value: point.value });
                        }}

                    >
                        ID: {point.id}
                    </button>

                ))}

                <h4>하계 10% 미만 데이터</h4>
                {belowRangePoints.map(point => (
                    <button
                        key={point.id}
                        style={{
                            margin: '5px',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#ececff',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            setSelectedPoint({ id: point.id, value: point.value });
                            if (onPointClick) onPointClick({ id: point.id, value: point.value });
                        }}

                    >
                        ID: {point.id}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChartWithClickablePoints;
