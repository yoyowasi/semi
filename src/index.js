import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import App from './App';
import LoginPage from './LoginPage';

// PrivateRoute 설정
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    console.log("PrivateRoute user state:", user); // 디버깅용 로그
    return user?.loggedIn ? children : <Navigate to="/login" replace />;
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <App />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    </React.StrictMode>
);
