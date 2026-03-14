import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        // Parse query params to find the 'token' sent by backend success handler
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            // Save token in context/localStorage
            login(token);
            // Redirect to protected area
            navigate('/dashboard', { replace: true });
        } else {
            // Login failed or token missing
            navigate('/login', { replace: true });
        }
    }, [location, navigate, login]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Authenticating...</h2>
            <p>Please wait while we log you in.</p>
        </div>
    );
};

export default OAuthCallback;
