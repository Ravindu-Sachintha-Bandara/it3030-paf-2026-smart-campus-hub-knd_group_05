import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OAuthCallback from './pages/OAuthCallback';
import DashboardPage from './pages/DashboardPage';

// PrivateRoute wrapper component
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Prevents flashing login screen if validating token
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth2/callback" element={<OAuthCallback />} />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <DashboardPage />
                    </PrivateRoute>
                }
            />

            {/* Default / Fallback Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    )
}

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;
