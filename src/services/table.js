    import React, { useEffect, useState } from 'react';
    import { useTable } from 'react-table';
    import result from '../ProcessedData.json';

    const Table = () => {
        const [data, setData] = useState([]); // 데이터를 저장할 상태

        useEffect(() => {
            setData(result); // 로컬 JSON 데이터로 상태 설정
        }, []);



        // API에서 데이터를 가져오는 함수
        useEffect(() => {
            const fetchData = async () => {
                const response = await fetch('http://daelim-semiconductor.duckdns.org:8080/api/data');
                const result = await response.json(); // JSON 형태로 데이터 파싱
                setData(result); // 상태에 데이터 저장
            };
            fetchData();
        }, []); // 빈 의존성 배열로 마운트 시에만 실행

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
            <div style={{ overflow: 'auto', maxHeight: '400px', maxWidth: '100%' }}>
                <table {...getTableProps()} style={{ border: 'solid 1px black', width: '100%', minWidth: '600px' }}>
                    <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()} style={{ padding: '10px', border: 'solid 1px gray', minWidth: '100px' }}>{column.render('Header')}</th>
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
                                    <td {...cell.getCellProps()} style={{ padding: '10px', border: 'solid 1px gray', minWidth: '100px' }}>{cell.render('Cell')}</td>
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
