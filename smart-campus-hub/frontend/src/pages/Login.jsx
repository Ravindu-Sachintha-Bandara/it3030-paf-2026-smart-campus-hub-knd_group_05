import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    // This listens for Google sending you back with the secret token
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (token) {
            localStorage.setItem('jwt_token', token);
            // After saving the token, send them to the dashboard
            navigate('/user/dashboard'); 
        }
    }, [navigate]);

    // This is the actual wire that connects to your Spring Boot backend
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
            padding: 0
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                textAlign: 'center',
                color: '#fff',
                maxWidth: '400px',
                width: '90%',
                position: 'relative',
                zIndex: 10
            }}>
                <h1 style={{ marginBottom: '10px', fontSize: '2.2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.6)', fontWeight: 'bold' }}>
                    Smart Campus Hub
                </h1>
                <p style={{ marginBottom: '30px', textShadow: '1px 1px 3px rgba(0,0,0,0.6)', fontSize: '1.1rem' }}>
                    Sign in to access your digital campus dashboard.
                </p>
                
                <button 
                    onClick={handleGoogleLogin}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        padding: '12px 20px',
                        backgroundColor: '#ffffff',
                        color: '#333',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s',
                        position: 'relative',
                        zIndex: 20
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <img 
                        src="https://www.svgrepo.com/show/475656/google-color.svg" 
                        alt="Google Logo" 
                        style={{ width: '24px', height: '24px', marginRight: '12px' }}
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;