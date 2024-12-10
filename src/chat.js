import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data, field }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && data.length > 0) {
      const ctx = canvasRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line', // 차트의 타입: 'line', 'bar', 'radar' 등
        data: {
          labels: data.map((_, index) => index), // X축 라벨
          datasets: [{
            label: field, // 데이터셋의 라벨
            data: data.map(item => item[field]), // 데이터
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // 컴포넌트 언마운트시 차트 인스턴스 제거
      return () => {
        chart.destroy();
      };
    }
  }, [data, field]);

  return <canvas ref={canvasRef} />;
};

export default ChartComponent;
