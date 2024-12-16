import React, { useState } from 'react';
import Showchat from './services/showchat';
import Table from './services/table';
import TestSend from "./services/TestSend";

const App = () => {
    const [activeComponent, setActiveComponent] = useState('showchat'); // 예: 기본값

    return (
        <div>
            <h1>Welcome to the Main Page</h1>
            <div>
                <button onClick={() => setActiveComponent('showchat')}>Show Chart</button>
                <button onClick={() => setActiveComponent('table')}>Show Table</button>
                <button onClick={() => setActiveComponent('TestSend')}>Test</button>
            </div>

            {activeComponent === 'showchat' && <Showchat />}
            {activeComponent === 'table' && <Table />}
            {activeComponent === "TestSend" && <TestSend />}
        </div>
    );
};

export default App;
