import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <AuthProvider>
            <Router> {/* 최상위 Router는 여기만 선언 */}
                <App />
            </Router>
        </AuthProvider>
    </React.StrictMode>
);
