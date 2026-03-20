import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [kpiStats, setKpiStats] = useState({ pendingBookings: 0, openTickets: 0, totalResources: 0 });

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const [bookingsRes, ticketsRes, resourcesRes] = await Promise.all([
                    api.get('/api/bookings'),
                    api.get('/api/tickets'),
                    api.get('/api/resources')
                ]);

                const bookings = bookingsRes.data || [];
                const tickets = ticketsRes.data || [];
                const resources = resourcesRes.data || [];

                const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
                const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'PENDING').length;
                const totalResources = resources.length;

                setKpiStats({ pendingBookings, openTickets, totalResources });
            } catch (err) {
                console.error("Error fetching KPIs:", err);
            }
        };

        fetchKpis();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>
                    Admin Dashboard
                </h1>
                <p style={{ color: '#666', marginTop: '5px' }}>System Overview and Administration</p>
            </header>

            <main>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div 
                        onClick={() => navigate('/bookings')}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
                        style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--sliit-light-bg)', borderTop: '4px solid var(--sliit-orange)', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Bookings</h3>
                        <span style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0f172a' }}>{kpiStats.pendingBookings}</span>
                    </div>

                    <div 
                        onClick={() => navigate('/tickets')}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
                        style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--sliit-light-bg)', borderTop: '4px solid var(--sliit-navy)', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Open Tickets</h3>
                        <span style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0f172a' }}>{kpiStats.openTickets}</span>
                    </div>

                    <div 
                        onClick={() => navigate('/resources')}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
                        style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--sliit-light-bg)', borderTop: '4px solid var(--sliit-gold)', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Resources</h3>
                        <span style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0f172a' }}>{kpiStats.totalResources}</span>
                    </div>
                </div>

                <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                        Administrator Profile
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Name</p>
                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{user?.name || 'Loading...'}</p>
                        </div>
                        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Email Address</p>
                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{user?.email || 'Loading...'}</p>
                        </div>
                        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Role Level</p>
                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>
                                <span style={{ padding: '4px 10px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontSize: '0.9rem' }}>
                                    {user?.role || 'ADMIN'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <h3 style={{ margin: '20px 0 0 0', fontSize: '1.2rem', color: '#334155' }}>Institutional Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Employee ID:</span>
                            <span style={{ color: '#334155', fontWeight: '500' }}>SYS-00192</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Department:</span>
                            <span style={{ color: '#334155', fontWeight: '500' }}>IT Operations</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Account Status:</span>
                            <span style={{ color: '#10b981', fontWeight: '600' }}>Active (Superuser)</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
