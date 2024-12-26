import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data, field }) => {
  const canvasRef = useRef(null);
  const [baseline, setBaseline] = useState(null);

  // 평균값을 API에서 가져와 설정
  useEffect(() => {
    const fetchAverage = async () => {
      try {
        const response = await fetch(`https://daelim-semiconductor.duckdns.org:8443/api/data/average/dynamic?fieldName=${field}`);
        const result = await response.json();
        setBaseline(result.average);  // API에서 평균값을 가져와 상태에 설정
      } catch (error) {
        console.error('Error fetching average:', error);
      }
    };

    fetchAverage();
  }, [field]);

  // 차트 생성 및 업데이트
  useEffect(() => {
    if (canvasRef.current && data.length > 0 && baseline !== null) {
      const ctx = canvasRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((_, index) => index.toString()),
          datasets: [{
            label: field,
            data: data.map(item => item[field]),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: false,
              min: Math.min(...data.map(item => item[field])) - 10,
              max: Math.max(...data.map(item => item[field])) + 10
            }
          },
          options: {
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  var dataLabel = data.datasets[tooltipItem.datasetIndex].label;
                  var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                  // 예쁜 JSON 포맷으로 변경
                  return dataLabel + ': ' + value + '\nAdditional Info: ' + JSON.stringify(value, null, 2);
                }
              },
              backgroundColor: '#FFFFFF',
              titleFontSize: 16,
              titleFontColor: '#000',
              bodyFontColor: '#000',
              bodyFontSize: 14,
              displayColors: false
            },
            responsive: true
          }

        }
      });
      return () => chart.destroy();
    }
  }, [data, field, baseline]);

  return <div style={{ height: '400px', width: '100%' }}>
    <canvas ref={canvasRef} />
  </div>;
};

export default ChartComponent;
