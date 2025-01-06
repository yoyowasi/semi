import React, { useState } from 'react';
import '../Css/scss/chat.scss';
import ChartWithClickablePoints from './ChartWithClickablePoints';

const Showchat = ({ data, loading, error }) => {
    const [selectedField, setSelectedField] = useState('oxygenload');
    const [selectedData, setSelectedData] = useState(null);
    const [average, setAverage] = useState(null);

    // 탭(필드) 목록 예시
    const fields = [
        { label: '산소부하량', field: 'oxygenload' },
        { label: '조습', field: 'humidity' },
        { label: '송풍압', field: 'windPressure' },
        // ... 필요 시 더 추가 ...
    ];

    const handlePointClick = (clickedData) => {
        console.log('Clicked Data:', clickedData);
        setSelectedData(clickedData);
    };

    if (loading) {
        return <div>Loading data, please wait...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="data-visualization-container">
            {/* 필드 선택 버튼 (가로 스크롤 가능) */}
            <div className="buttons-container">
                {fields.map(({ label, field }) => (
                    <button
                        key={field}
                        onClick={() => setSelectedField(field)}
                        className={`button ${selectedField === field ? 'active' : ''}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* 차트와 평균값, 클릭된 데이터 표시 */}
            <div className="chart-and-average-container">
                <div className="chart-container">
                    <ChartWithClickablePoints
                        data={data}
                        field={selectedField}
                        onBaselineUpdate={setAverage}
                        onPointClick={handlePointClick}
                        width={600} /* 필요 시 크기 조절 */
                    />
                </div>

                <div className="average-text">
                    <p>평균값: {average ? average.toFixed(2) : '계산 중...'}</p>
                    {selectedData && (
                        <div>
                            <h4>클릭한 데이터:</h4>
                            <p><strong>ID:</strong> {selectedData.id}</p>
                            <pre>{JSON.stringify(selectedData, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Showchat;
