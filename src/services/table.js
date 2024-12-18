import React, { useEffect, useState } from 'react';
import { useTable } from 'react-table';
import '../Css/TableStyle.css'; // CSS 스타일시트 임포트

const Table = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:8080/api/data', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // 토큰을 헤더에 포함
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
                }
                const result = await response.json();
                if (result.length === 0) {
                    throw new Error("No data available");
                }
                setData(result);
            } catch (error) {
                setError(`Failed to fetch data: ${error.message}`);
            }
        };

        fetchData();
    }, []);


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
            { Header: 'PCI량 (PV)', accessor: 'pciRatePV' },
            { Header: '용선 온도', accessor: 'hotMetaTemperature' },
            { Header: '직전 용선온도', accessor: 'previousHotMetalTemperature' }
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div style={{ overflow: 'auto', maxHeight: '400px' }}>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <table {...getTableProps()} className="table">
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()} key={column.id}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()} key={row.id}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()} key={cell.column.id}>{cell.render('Cell')}</td>
                            ))}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
