import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for an existing token on app load
        const token = localStorage.getItem('authToken');
        if (token) {
            // In a real app, you'd decode the JWT to get the role or validate it with the backend
            try {
                const payloadBase64 = token.split('.')[1];
                const decodedJson = atob(payloadBase64);
                const decodedToken = JSON.parse(decodedJson);

                setIsAuthenticated(true);
                setUserRole(decodedToken.role || 'USER'); // Default fallback
            } catch (error) {
                console.error('Failed to parse token', error);
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('authToken', token);

        // Decode token to get roles
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedToken = JSON.parse(atob(payloadBase64));
            setIsAuthenticated(true);
            setUserRole(decodedToken.role);
        } catch (e) {
            setIsAuthenticated(true);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
