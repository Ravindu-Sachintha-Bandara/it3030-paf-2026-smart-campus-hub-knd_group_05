import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
    const { isAuthenticated } = useAuth();

    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleGoogleLogin = () => {
        // Redirects browser to Spring Boot OAuth2 endpoint
        // Spring Boot will then redirect user to Google for sign in
        // After sign in, Spring redirects back to our React app (/oauth2/callback)
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
            <h1>Smart Campus Operations Hub</h1>
            <p>Please log in to continue</p>

            <button
                onClick={handleGoogleLogin}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                Sign in with Google
            </button>
        </div>
    );
};

export default LoginPage;
