import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Parse the URL search parameters to locate the ?token= querystring.
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
            // If a token is found, save it to localStorage
            localStorage.setItem('jwt_token', token);

            // Redirect the user to the protected dashboard
            navigate('/dashboard', { replace: true });
        } else {
            // If no token is found, redirect them back to the login page with an error
            navigate('/login?error=true', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Authenticating...</h2>
            <p>Please wait while we log you in.</p>
        </div>
    );
};

export default OAuth2RedirectHandler;
