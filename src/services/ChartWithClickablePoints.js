import React, { useEffect, useState } from 'react';
import { LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Scatter } from 'recharts';
import '../Css/scss/chat.scss';

// ✅ 숫자 포맷터 함수
const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`; // 백만 단위
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`; // 천 단위
    if (Number.isInteger(num)) return num; // 정수는 그대로
    return num.toFixed(2); // 소수점 둘째 자리까지
};

// ✅ 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const isAbove = value > payload[0].payload.avg * 1.1;
        const isBelow = value < payload[0].payload.avg * 0.9;

        return (
            <div className="tooltip">
                <p>ID: {label}</p>
                <p>Field Value: {formatNumber(value)}</p>
                {isAbove && <p style={{ color: 'red' }}>⚠ 초과값 (Above +10%)</p>}
                {isBelow && <p style={{ color: 'blue' }}>⚠ 미만값 (Below -10%)</p>}
            </div>
        );
    }
    return null;
};

// ✅ 메인 차트 컴포넌트
const ChartWithClickablePoints = ({ data, field, onBaselineUpdate, onPointClick }) => {
    const [avg, setAvg] = useState(0);

    useEffect(() => {
        const total = data.reduce((acc, item) => acc + (item[field] || 0), 0);
        const average = total / data.length;
        setAvg(average);
        if (onBaselineUpdate && typeof onBaselineUpdate === 'function') {
            onBaselineUpdate(average);
        } else {
            console.error('onBaselineUpdate is not a function or is undefined');
        }
    }, [data, field, onBaselineUpdate]);

    const yRange = avg * 0.1; // 평균값의 ±10%

    // ✅ 강조 데이터 포인트 계산
    const highlightedPoints = data
        .filter((item) => item[field] > avg + yRange || item[field] < avg - yRange)
        .map((item) => ({ id: item.id, value: item[field] }));

    return (
        <div className="chart-container">
            <LineChart
                width={800}
                height={400}
                data={data.map((item) => ({ ...item, avg }))}
                onClick={(e) => {
                    if (onPointClick && e && e.activePayload) {
                        onPointClick(e.activePayload[0].payload);
                    }
                }}
            >
                {/* ✅ 그리드 */}
                <CartesianGrid strokeDasharray="3 3" />

                {/* ✅ X축 */}
                <XAxis
                    dataKey="id"
                    tickFormatter={(value) => formatNumber(value)}
                    label={null} /* Label 제거 */
                />

                {/* ✅ Y축 */}
                <YAxis
                    domain={[avg - yRange * 2, avg + yRange * 2]}
                    tickFormatter={(value) => formatNumber(value)}
                    label={null} /* Label 제거 */
                />

                {/* ✅ 툴팁 */}
                <Tooltip content={<CustomTooltip />} />

                {/* ✅ 평균값 ±10% 선 */}
                <ReferenceLine y={avg + yRange} stroke="#FF5733" strokeDasharray="4 4" label="Avg +10%" />
                <ReferenceLine y={avg - yRange} stroke="#3498DB" strokeDasharray="4 4" label="Avg -10%" />
                <ReferenceLine y={avg} stroke="#2ECC71" strokeWidth={2} label="Avg" />

                {/* ✅ 데이터 라인 */}
                <Line
                    type="linear"
                    dataKey={field}
                    stroke="#01DFD7"
                    strokeWidth={3}
                    dot={false}
                />

                {/* ✅ 초과 및 미만 값 강조 */}
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
