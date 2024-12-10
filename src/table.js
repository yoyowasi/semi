import React from 'react';
import { useTable } from 'react-table';
import data from './ProcessedData.json'; // JSON 파일의 경로를 정확히 지정해주세요.

const Table = () => {
  // 열 구성
  const columns = React.useMemo(
    () => [
      { Header: 'ID', accessor: 'id' },
      { Header: 'Oxygen Load', accessor: 'oxygenload' },
      { Header: 'Humidity', accessor: 'humidity' },
      { Header: 'Wind Pressure', accessor: 'windPressure' },
      { Header: 'Wind Speed', accessor: 'windSpeed' },
      { Header: 'Basting Energy', accessor: 'bastingEnergy' },
      { Header: 'Road Gas Flow Velocity', accessor: 'roadGasFlowVelocity' },
      { Header: 'Air Permeability Index', accessor: 'airPermeabilityIndex' },
      { Header: 'Air Outlet S1 Stage Ventilation Resistance Index', accessor: 'airoutletS1StageVentilationResistanceIndex' },
      { Header: 'S4 Stage To Street Ventilation Resistance Index', accessor: 's4StageToStreetVentilationResistanceIndex' },
      { Header: 'Pressure Difference', accessor: 'pressureDifference' },
      { Header: 'Pressure Loss', accessor: 'pressureLoss' },
      { Header: 'Heat Flow Ratio', accessor: 'heatFlowRatio' },
      { Header: 'Direct Reduction Consumption Of Cokes', accessor: 'directReductionConsumptionOfCokes' },
      { Header: 'Front Combustion Zone Depth', accessor: 'frontCombustionZoneDepth' },
      { Header: 'Slag Basicity', accessor: 'slagBasicity' },
      { Header: 'PCI Rate PV', accessor: 'pciRate_PV' },
      { Header: 'Hot Metal Temperature', accessor: 'hotMetaTemperature' },
      { Header: 'Previous Hot Metal Temperature', accessor: 'previousHotMetalTemperature' }
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
