import React, { useEffect } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for authentication
    if (!localStorage.getItem('jwt_token')) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
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
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--sliit-light-bg)' }}>
            {/* Left Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--white)',
                borderRight: '1px solid #E5E7EB',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                boxShadow: '2px 0 8px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
            }}>
                <div style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: 'var(--sliit-navy)', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                        Smart Campus Hub
                    </h2>
                </div>
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                    <NavLink to="/" style={({ isActive }) => ({
                        display: 'flex',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive && location.pathname === '/' ? 'var(--sliit-navy)' : 'var(--sliit-gray)',
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        backgroundColor: isActive && location.pathname === '/' ? 'var(--sliit-light-bg)' : 'transparent',
                        borderLeft: isActive && location.pathname === '/' ? '4px solid var(--sliit-orange)' : '4px solid transparent',
                        transition: 'all 0.15s ease-in-out',
                        boxSizing: 'border-box'
                    })}
                        onMouseOver={(e) => { if (location.pathname !== '/') { e.currentTarget.style.color = 'var(--sliit-navy)'; e.currentTarget.style.backgroundColor = 'var(--sliit-light-bg)'; e.currentTarget.style.borderLeft = '4px solid var(--sliit-orange)'; } }}
                        onMouseOut={(e) => { if (location.pathname !== '/') { e.currentTarget.style.color = 'var(--sliit-gray)'; e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderLeft = '4px solid transparent'; } }}
                    >
                        Home
                    </NavLink>
                    {navItems.map(item => (
                        <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
                            display: 'flex',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: isActive ? 'var(--sliit-navy)' : 'var(--sliit-gray)',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            backgroundColor: isActive ? 'var(--sliit-light-bg)' : 'transparent',
                            borderLeft: isActive ? '4px solid var(--sliit-orange)' : '4px solid transparent',
                            transition: 'all 0.15s ease-in-out',
                            boxSizing: 'border-box'
                        })}
                            onMouseOver={(e) => { if (location.pathname !== item.path) { e.currentTarget.style.color = 'var(--sliit-navy)'; e.currentTarget.style.backgroundColor = 'var(--sliit-light-bg)'; e.currentTarget.style.borderLeft = '4px solid var(--sliit-orange)'; } }}
                            onMouseOut={(e) => { if (location.pathname !== item.path) { e.currentTarget.style.color = 'var(--sliit-gray)'; e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderLeft = '4px solid transparent'; } }}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content wrapper */}
            <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Header */}
                <header style={{
                    backgroundColor: 'var(--white)',
                    height: '70px',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 32px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    boxSizing: 'border-box'
                }}>
                    <div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--sliit-dark-navy)', fontSize: '0.95rem', lineHeight: '1.2' }}>{user?.name || 'User'}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--sliit-gray)', lineHeight: '1' }}>{user?.email || 'user@hub.com'}</p>
                        </div>
                        <button onClick={handleLogout} style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--sliit-gray)',
                            color: 'var(--sliit-gray)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                        }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--sliit-navy)'; e.currentTarget.style.color = 'var(--sliit-navy)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--sliit-gray)'; e.currentTarget.style.color = 'var(--sliit-gray)'; }}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ padding: '30px', flex: 1, maxWidth: '1400px', width: '100%' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
