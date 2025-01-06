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

// 커스텀 툴팁
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const avg = payload[0].payload.avg;
        const isAbove = value > avg * 1.1;
        const isBelow = value < avg * 0.9;

        return (
            <div className="tooltip">
                <p>ID: {label}</p>
                <p>Value: {formatNumber(value)}</p>
                {isAbove && <p style={{ color: 'red' }}>⚠ 평균 +10% 초과</p>}
                {isBelow && <p style={{ color: 'blue' }}>⚠ 평균 -10% 미만</p>}
            </div>
        );
    }
    return null;
};

// 메인 차트 컴포넌트
const ChartWithClickablePoints = ({ data, field, onBaselineUpdate, onPointClick, width = 800, height = 400 }) => {
    const [avg, setAvg] = useState(0);

    useEffect(() => {
        if (!data || data.length === 0) return;
        const total = data.reduce((acc, item) => acc + (item[field] || 0), 0);
        const average = total / data.length;
        setAvg(average);

        // 부모로 평균값 전달
        if (onBaselineUpdate && typeof onBaselineUpdate === 'function') {
            onBaselineUpdate(average);
        }
    }, [data, field, onBaselineUpdate]);

    // 평균값 ±10% 범위를 기준으로 Y축 범위를 결정
    const yRange = avg * 0.1;
    const yMin = Math.min(...data.map(item => item[field] || 0), avg - yRange * 2);
    const yMax = Math.max(...data.map(item => item[field] || 0), avg + yRange * 2);

    // 초과/미만 값 강조 표시
    const highlightedPoints = data
        .filter(item => item[field] > avg + yRange || item[field] < avg - yRange)
        .map(item => ({ id: item.id, value: item[field] }));

    return (
        <div className="chart-container">
            <LineChart
                width={width}
                height={height}
                data={data.map(item => ({ ...item, avg }))}
                onClick={(e) => {
                    // 클릭한 좌표에 activePayload가 있으면 onPointClick 실행
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

                <Tooltip content={<CustomTooltip />} />

                {/* 평균값 ±10% ReferenceLine */}
                <ReferenceLine y={avg + yRange} stroke="#FF5733" strokeDasharray="4 4" label="Avg +10%" />
                <ReferenceLine y={avg - yRange} stroke="#3498DB" strokeDasharray="4 4" label="Avg -10%" />
                <ReferenceLine y={avg} stroke="#2ECC71" strokeWidth={2} label="Avg" />

                {/* 실제 라인 */}
                <Line
                    type="linear"
                    dataKey={field}
                    stroke="#01DFD7"
                    strokeWidth={3}
                    dot={false}
                />

                {/* 초과/미만 포인트 (Scatter) */}
                <Scatter
                    data={highlightedPoints}
                    fill="red"
                    shape="circle"
                    name="Above/Below Range"
                />
            </LineChart>
        </div>
    );
};

export default ChartWithClickablePoints;
