import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div>Please login to view this page.</div>;
    }

    return <div>Welcome! You are logged in.</div>;
};

export default ProtectedPage;
