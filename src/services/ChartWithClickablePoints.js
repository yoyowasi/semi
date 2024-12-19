import React, { useEffect, useState } from 'react';
import { LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid, Label } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip" style={{ whiteSpace: 'prewrap' }}>
                <p>ID: {label}</p>
                <p>Field Value: {payload[0].value}</p>

            </div>
        );
    }
    return null;
};

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

    const yRange = avg * 0.1;

    return (
        <div style={{ position: 'relative', height: '500px' ,left: '-10%' }}> {/* 컨테이너에 높이 추가 */}
            <LineChart
                width={800}
                height={400}
                data={data}
                onClick={(e) => {
                    if (onPointClick && e && e.activePayload) {
                        console.log("Active Payload:", e.activePayload);
                        onPointClick(e.activePayload[0].payload);
                    }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id">
                    <Label value="ID" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis
                    label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                    domain={[avg - yRange, avg + yRange]}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{
                        position: 'absolute',
                        top: '400px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none',
                        width: '400px'  // 너비를 400px로 설정
                    }}
                />

                <Line type="linear" dataKey={field} stroke="#01DFD7" strokeWidth={3} dot={false} />
            </LineChart>
        </div>
    );
};

export default ChartWithClickablePoints;
