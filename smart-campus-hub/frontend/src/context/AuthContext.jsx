import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                // Fetch the real user from your new backend endpoint
                const response = await api.get('/api/users/me');
                setUser(response.data);
            } catch (error) {
                console.error("Auth fetch error:", error);
                // If token is invalid/expired, trash it
                localStorage.removeItem('jwt_token');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []); // <--- THIS EMPTY ARRAY STOPS THE INFINITE LOOP!

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);