import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const UserRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'ADMIN') {
        return <Navigate to="/user/dashboard" replace />;
    }

    return children;
};
