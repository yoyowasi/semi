import React, { useEffect } from 'react';
import { LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid, Label } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip">
                <p>ID: {label}</p>
                <p>Value: {payload[0].value}</p>
                <p>Additional Info: {JSON.stringify(payload[0].payload, null, 2)}</p>
            </div>
        );
    }

    return null;
};

const ChartWithClickablePoints = ({ data, field, onBaselineUpdate, onPointClick }) => {
    useEffect(() => {
        if (onBaselineUpdate && typeof onBaselineUpdate === 'function') {
            const avg = data.reduce((acc, item) => acc + (item[field] || 0), 0) / data.length;
            console.log('Calculated average:', avg);
            onBaselineUpdate(avg); // 평균값 전달
        } else {
            console.error('onBaselineUpdate is not a function or is undefined');
        }
    }, [data, field, onBaselineUpdate]);

    return (
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
            <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={field} stroke="#8884d8" dot={true} />
        </LineChart>
    );
};

export default ChartWithClickablePoints;
