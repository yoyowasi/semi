import React from 'react';
import { useTable } from 'react-table';
import data from '../ProcessedData.json'; // JSON 파일의 경로를 정확히 지정해주세요.

const Table = () => {
  // 열 구성
  const columns = React.useMemo(
    () => [
      { Header: 'ID', accessor: 'id' },
      { Header: '산소부하량', accessor: 'oxygenload' },
      { Header: '조습', accessor: 'humidity' },
      { Header: '송풍압, 풍압', accessor: 'windPressure' },
      { Header: '풍구전 속도, 풍구 유속', accessor: 'windSpeed' },
      { Header: '송풍 에너지', accessor: 'bastingEnergy' },
      { Header: '노정가스 유속', accessor: 'roadGasFlowVelocity' },
      { Header: '통기저항지수', accessor: 'airPermeabilityIndex' },
      { Header: '풍구 ~ S1단 통기저항지수', accessor: 'airoutletS1StageVentilationResistanceIndex' },
      { Header: 'S4단 ~ 노정 통기저항지수', accessor: 's4StageToStreetVentilationResistanceIndex' },
      { Header: '압력차이', accessor: 'pressureDifference' },
      { Header: '압력 손실', accessor: 'pressureLoss' },
      { Header: '열류비', accessor: 'heatFlowRatio' },
      { Header: '직접환원 소모 코크스량', accessor: 'directReductionConsumptionOfCokes' },
      { Header: '풍구 앞 연소대 깊이', accessor: 'frontCombustionZoneDepth' },
      { Header: '슬래그 염기도', accessor: 'slagBasicity' },
      { Header: 'PCI량 (PV)', accessor: 'pciRate_PV' },
      { Header: '용선 온도', accessor: 'hotMetaTemperature' },
      { Header: '직전 용선온도', accessor: 'previousHotMetalTemperature' }
    ],
    []
  );

  // useTable 훅을 사용하여 테이블 인스턴스 생성
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  // 테이블 렌더링
  return (
    <table {...getTableProps()} style={{ border: 'solid 1px black' }}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} style={{ padding: '10px', border: 'solid 1px gray' }}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()} style={{ padding: '10px', border: 'solid 1px gray' }}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
