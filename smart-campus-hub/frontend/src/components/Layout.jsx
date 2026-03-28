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

    const adminItems = [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/bookings', label: 'Bookings' },
        { path: '/admin/tickets', label: 'Tickets' },
        { path: '/resources', label: 'Resources' }
    ];

    const userItems = [
        { path: '/user/dashboard', label: 'Dashboard' },
        { path: '/bookings', label: 'Bookings' },
        { path: '/tickets', label: 'Tickets' },
        { path: '/resources', label: 'Resources' }
    ];

    const navItems = user?.role === 'ADMIN' ? adminItems : userItems;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            {/* Left Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--sidebar-bg)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                boxSizing: 'border-box'
            }}>
                <div style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: 'var(--white)', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                        Smart Campus Hub
                    </h2>
                </div>
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                    <NavLink to="/" style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive && location.pathname === '/' ? 'var(--white)' : 'var(--text-sidebar)',
                        fontWeight: isActive && location.pathname === '/' ? 'bold' : '500',
                        fontSize: '0.95rem',
                        backgroundColor: isActive && location.pathname === '/' ? 'var(--accent-orange)' : 'transparent',
                        transition: 'all 0.15s ease-in-out',
                        boxSizing: 'border-box'
                    })}
                        onMouseOver={(e) => { if (location.pathname !== '/') { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; } }}
                        onMouseOut={(e) => { if (location.pathname !== '/') { e.currentTarget.style.color = 'var(--text-sidebar)'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Home
                    </NavLink>
                    {navItems.map(item => {
                        let icon;
                        switch(item.label) {
                            case 'Dashboard':
                            case 'Admin Dashboard':
                                icon = <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
                                break;
                            case 'Tickets':
                                icon = <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
                                break;
                            case 'Resources':
                                icon = <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
                                break;
                            case 'Notifications':
                                icon = <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
                                break;
                            case 'Bookings':
                                icon = <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
                                break;
                            default:
                                icon = <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                        }

                        return (
                            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isActive ? 'var(--white)' : 'var(--text-sidebar)',
                                fontWeight: isActive ? 'bold' : '500',
                                fontSize: '0.95rem',
                                backgroundColor: isActive ? 'var(--accent-orange)' : 'transparent',
                                transition: 'all 0.15s ease-in-out',
                                boxSizing: 'border-box'
                            })}
                                onMouseOver={(e) => { if (location.pathname !== item.path) { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; } }}
                                onMouseOut={(e) => { if (location.pathname !== item.path) { e.currentTarget.style.color = 'var(--text-sidebar)'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
                            >
                                {icon}
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content wrapper */}
            <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
                {/* Top Header */}
                <header style={{
                    backgroundColor: 'var(--white)',
                    borderRadius: '12px',
                    margin: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end', /* Pushes the profile/notifications to the right */
                    padding: '12px 24px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    boxSizing: 'border-box'
                }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button 
                            onClick={() => navigate('/notifications')}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-sidebar)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', padding: '4px' }}
                            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--sliit-dark-navy)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-sidebar)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            <span style={{ position: 'absolute', top: '2px', right: '4px', width: '8px', height: '8px', backgroundColor: 'var(--accent-orange)', borderRadius: '50%', border: '2px solid var(--white)' }}></span>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid #E5E7EB', paddingLeft: '24px' }}>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <p style={{ margin: 0, fontWeight: '700', color: 'var(--sliit-dark-navy)', fontSize: '0.95rem', lineHeight: '1.2' }}>{user?.name || 'User'}</p>
                                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--sliit-gray)', lineHeight: '1' }}>{user?.email || 'user@hub.com'}</p>
                            </div>
                            <button onClick={handleLogout} style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--bg-main)',
                                border: 'none',
                                color: 'var(--sliit-dark-navy)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-main)'; }}
                            >
                                Logout
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ padding: '8px 24px 30px 24px', flex: 1, maxWidth: '1400px', width: '100%' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;