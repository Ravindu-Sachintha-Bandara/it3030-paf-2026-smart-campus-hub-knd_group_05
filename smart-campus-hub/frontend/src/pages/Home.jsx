import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ color: 'var(--sliit-dark-navy)', margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    Welcome to Smart Campus Hub
                </h1>
                <p style={{ color: 'var(--sliit-gray)', fontSize: '1.1rem', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                    Manage your facilities, book rooms, and track resources securely and efficiently all from one central dashboard.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Bookings Card */}
                <div
                    style={{
                        background: 'var(--white)', borderRadius: '16px', padding: '24px', border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '15px' }}>📅</div>
                    <h2 style={{ color: 'var(--sliit-navy)', marginTop: 0, marginBottom: '15px', fontSize: '1.3rem' }}>Bookings</h2>
                    <p style={{ color: 'var(--sliit-gray)', marginBottom: '25px', lineHeight: '1.5', minHeight: '45px' }}>
                        Reserve study rooms, auditoriums, and campus facilities in real-time.
                    </p>
                    <button
                        onClick={() => navigate('/user/bookings')}
                        style={{
                            backgroundColor: 'var(--sliit-orange)', color: 'white', padding: '10px 20px', borderRadius: '8px',
                            fontWeight: '600', border: 'none', cursor: 'pointer', display: 'inline-block', textAlign: 'center',
                            width: '100%', transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sliit-orange-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sliit-orange)'}
                    >
                        Go to Bookings
                    </button>
                </div>

                {/* Tickets Card */}
                <div
                    style={{
                        background: 'var(--white)', borderRadius: '16px', padding: '24px', border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🎫</div>
                    <h2 style={{ color: 'var(--sliit-navy)', marginTop: 0, marginBottom: '15px', fontSize: '1.3rem' }}>Support Tickets</h2>
                    <p style={{ color: 'var(--sliit-gray)', marginBottom: '25px', lineHeight: '1.5', minHeight: '45px' }}>
                        Submit support requests or view the status of your existing IT tickets.
                    </p>
                    <button
                        onClick={() => navigate('/user/tickets')}
                        style={{
                            backgroundColor: 'var(--sliit-orange)', color: 'white', padding: '10px 20px', borderRadius: '8px',
                            fontWeight: '600', border: 'none', cursor: 'pointer', display: 'inline-block', textAlign: 'center',
                            width: '100%', transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sliit-orange-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sliit-orange)'}
                    >
                        Manage Tickets
                    </button>
                </div>

                {/* Resources Card */}
                <div
                    style={{
                        background: 'var(--white)', borderRadius: '16px', padding: '24px', border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '15px' }}>📦</div>
                    <h2 style={{ color: 'var(--sliit-navy)', marginTop: 0, marginBottom: '15px', fontSize: '1.3rem' }}>Resources</h2>
                    <p style={{ color: 'var(--sliit-gray)', marginBottom: '25px', lineHeight: '1.5', minHeight: '45px' }}>
                        Explore computing equipment, projectors, and available hardware.
                    </p>
                    <button
                        onClick={() => navigate('/resources')}
                        style={{
                            backgroundColor: 'var(--sliit-orange)', color: 'white', padding: '10px 20px', borderRadius: '8px',
                            fontWeight: '600', border: 'none', cursor: 'pointer', display: 'inline-block', textAlign: 'center',
                            width: '100%', transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sliit-orange-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sliit-orange)'}
                    >
                        View Resources
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
