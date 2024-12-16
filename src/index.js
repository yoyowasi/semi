import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './LoginPage';
import HomePage from './App';

const container = document.getElementById('root');
const root = createRoot(container);  // 수정: ReactDOM.createRoot -> createRoot

root.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Navigate replace to="/login" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
            </Routes>
        </Router>
    </React.StrictMode>
);
