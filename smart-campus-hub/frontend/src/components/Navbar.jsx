import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const commonItems = [
        { path: '/resources', label: 'Resources' },
        { path: '/notifications', label: 'Notifications' }
    ];

    const adminItems = [
        { path: '/admin/dashboard', label: 'Admin Dashboard' },
        { path: '/admin/bookings', label: 'Manage Bookings' },
        { path: '/admin/tickets', label: 'Manage Tickets' },
        ...commonItems
    ];

    const userItems = [
        { path: '/user/dashboard', label: 'Dashboard' },
        { path: '/user/bookings', label: 'Bookings' },
        { path: '/user/tickets', label: 'Tickets' },
        ...commonItems
    ];

    const navItems = user?.role === 'ADMIN' ? adminItems : userItems;

    return (
        <nav style={{
            backgroundColor: '#0f172a', /* Deep slate/navy blue */
            color: 'white',
            padding: '16px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                letterSpacing: '-0.025em',
                background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Smart Campus Hub
            </div>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                color: isActive ? '#60a5fa' : '#cbd5e1',
                                textDecoration: 'none',
                                fontWeight: isActive ? '600' : '500',
                                fontSize: '0.95rem',
                                padding: '8px 0',
                                borderBottom: isActive ? '2px solid #60a5fa' : '2px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.target.style.color = '#cbd5e1';
                            }}
                        >
                            {item.label}
                        </Link>
                    );
                })}
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px 20px',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginLeft: '15px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#ef4444';
                        e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#ef4444';
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
