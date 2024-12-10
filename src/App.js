import React, { useState } from 'react';
import Showchat from './showchat';
import Table from './table';

const App = () => {
  // 활성화된 컴포넌트를 관리하기 위한 상태
  const [activeComponent, setActiveComponent] = useState('none');

  return (
    <div>
      <h1>Data Visualization</h1>
      <div>
        {/* 버튼 클릭 시 활성화되는 컴포넌트를 설정 */}
        <button onClick={() => setActiveComponent('showchat')}>Show Chart</button>
        <button onClick={() => setActiveComponent('table')}>Show Table</button>
      </div>
      
      {/* 조건부 렌더링을 통해 컴포넌트 표시 */}
      {activeComponent === 'showchat' && <Showchat />}
      {activeComponent === 'table' && <Table />}
    </div>
  );
};

export default App;
