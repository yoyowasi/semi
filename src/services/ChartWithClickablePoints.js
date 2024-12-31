import React, { useEffect, useState } from 'react';
import { LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid, Label } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip">
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
        <div className="chart-container">
            <LineChart
                width={800} // 최대 너비 설정
                height={400} // 높이 설정
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
                <Tooltip content={<CustomTooltip />} />
                <Line type="linear" dataKey={field} stroke="#01DFD7" strokeWidth={3} dot={false} />
            </LineChart>
        </div>
    );
};

export default ChartWithClickablePoints;
