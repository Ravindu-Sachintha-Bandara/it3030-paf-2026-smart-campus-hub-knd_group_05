import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const quickLinks = [
        {
            title: 'Bookings',
            description: 'Reserve rooms, equipment, and campus facilities instantly.',
            linkText: 'Go to Bookings \u2192',
            icon: '📅',
            route: '/bookings'
        },
        {
            title: 'Support Tickets',
            description: 'Report technical issues or request maintenance assistance.',
            linkText: 'Go to Tickets \u2192',
            icon: '🎫',
            route: '/tickets'
        },
        {
            title: 'Resources',
            description: 'Browse the catalog of premium campus assets and inventory.',
            linkText: 'Go to Resources \u2192',
            icon: '🏢',
            route: '/resources'
        }
    ];

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Hero Banner */}
            <div style={{ 
                position: 'relative',
                backgroundColor: '#0f172a', 
                borderRadius: '16px', 
                padding: '40px',
                marginBottom: '40px',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
                {/* Decorative radial gradient for premium look */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, rgba(15,23,42,0) 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                    <h1 style={{ margin: 0, color: 'white', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                        Welcome to Smart Campus Hub
                    </h1>
                    <p style={{ margin: '16px 0 0 0', color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: '500' }}>
                        Manage your facilities, book rooms, and track resources securely and efficiently all from one central dashboard.
                    </p>
                </div>
            </div>

            {/* Quick Launch Interactive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {quickLinks.map((item, index) => (
                    <div 
                        key={index}
                        onClick={() => navigate(item.route)}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            padding: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.borderColor = '#ea580c';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: '24px' }}>{item.icon}</div>
                        <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>
                            {item.title}
                        </h2>
                        <p style={{ margin: '0 0 32px 0', color: '#334155', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1, fontWeight: '500' }}>
                            {item.description}
                        </p>
                        <div style={{ marginTop: 'auto', color: '#ea580c', fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
                            {item.linkText}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
