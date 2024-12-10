import React, { useState } from 'react';
import rawData from './ProcessedData.json'; // JSON 파일 경로 정확히 설정
import ChartComponent from './chat.js';         ; // 차트 컴포넌트 파일명 확인

const Showchat = () => {
  const [selectedField, setSelectedField] = useState('oxygenload'); // 초기 선택 필드

  // 데이터 필드와 버튼 레이블을 매핑
  const fields = [
    { label: '산소부하량', field: 'oxygenload' },
    { label: '조습', field: 'humidity' },
    { label: '송풍압, 풍압', field: 'windPressure' },
    { label: '풍구전 속도, 풍구 유속', field: 'windSpeed' },
    { label: '송풍 에너지', field: 'bastingEnergy' },
    { label: '노정가스 유속', field: 'roadGasFlowVelocity' },
    { label: '통기저항지수', field: 'airPermeabilityIndex' }, // 가정된 필드 이름
    { label: '풍구 ~ S1단 통기저항지수', field: 's1ResistanceIndex' }, // 가정된 필드 이름
    { label: 'S4단 ~ 노정 통기저항지수', field: 's4ResistanceIndex' }, // 가정된 필드 이름
    { label: '압력차이', field: 'pressureDifference' }, // 가정된 필드 이름
    { label: '압력 손실', field: 'pressureLoss' }, // 가정된 필드 이름
    { label: '열류비', field: 'heatFlowRatio' }, // 가정된 필드 이름
    { label: '직접환원 소모 코크스량', field: 'cokeConsumption' }, // 가정된 필드 이름
    { label: '풍구 앞 연소대 깊이', field: 'combustionZoneDepth' }, // 가정된 필드 이름
    { label: '슬래그 염기도', field: 'slagBasicity' }, // 가정된 필드 이름
    { label: 'PCI량 (PV)', field: 'pciRate' }, // 가정된 필드 이름
    { label: '용선 온도', field: 'hotMetalTemperature' }, // 가정된 필드 이름
    { label: '직전 용선온도', field: 'previousHotMetalTemperature' } // 가정된 필드 이름
  ];

  return (
    <div>
    
      <div>
        {fields.map(({ label, field }) => (
          <button key={field} onClick={() => setSelectedField(field)}>
            {label}
          </button>
        ))}
      </div>
      <ChartComponent data={rawData} field={selectedField} />
    </div>
  );
};

export default Showchat;
