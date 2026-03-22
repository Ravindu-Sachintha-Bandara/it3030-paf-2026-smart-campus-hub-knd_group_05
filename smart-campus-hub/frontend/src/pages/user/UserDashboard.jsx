import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({ 
        bookings: 0, 
        tickets: 0, 
        approvals: 0, 
        notifications: 0,
        recentActivity: [],
        upcoming: []
    });

    const fetchUserData = async () => {
        try {
            const [bRes, tRes] = await Promise.all([
                api.get('/api/bookings'),
                api.get('/api/tickets')
            ]);
            
            // 1. Filter data for the logged-in user
            const myRawBookings = bRes.data?.filter(b => b.userId === user?.id || b.user?.id === user?.id) || [];
            const myRawTickets = tRes.data?.filter(t => t.userId === user?.id || t.user?.id === user?.id) || [];

            // 2. Derive KPI Stats
            const approvedBookings = myRawBookings.filter(b => b.status === 'APPROVED');
            const pendingApprovals = myRawBookings.filter(b => b.status === 'PENDING');
            const openTickets = myRawTickets.filter(t => t.status !== 'CLOSED');

            // 3. Generate Real Activity Feed (Merging bookings and tickets)
            const activities = [
                ...myRawBookings.map(b => ({ 
                    title: 'Booking Update', 
                    desc: `${b.resource?.name || 'Resource'}: Status is ${b.status}`, 
                    time: 'Recent', 
                    icon: b.status === 'APPROVED' ? '✅' : '⏳' 
                })),
                ...myRawTickets.map(t => ({ 
                    title: 'Ticket Status', 
                    desc: `Ticket #${t.id.toString().slice(-4)} is ${t.status}`, 
                    time: 'Update', 
                    icon: '🎫' 
                }))
            ].slice(0, 3); // Show top 3

            // 4. Find Upcoming Bookings (Approved and in the future)
            const upcoming = approvedBookings
                .filter(b => new Date(b.startTime) > new Date())
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .slice(0, 2);

            setStats({
                bookings: approvedBookings.length,
                tickets: openTickets.length,
                approvals: pendingApprovals.length,
                notifications: myRawTickets.length + pendingApprovals.length, // Logic for notification count
                recentActivity: activities,
                upcoming: upcoming
            });
        } catch (err) {
            console.error("Dashboard real-time sync error:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserData();
            // Polling: Refresh every 10 seconds for "Real-time" feel
            const interval = setInterval(fetchUserData, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Calendar logic: Generate dates for the current week
    const today = new Date();
    const currentDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - today.getDay() + i);
        return d.getDate();
    });

    return (
        <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Welcome Banner */}
            <div style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                padding: '40px', borderRadius: '16px', color: 'white', marginBottom: '32px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '2.2rem', margin: 0, fontWeight: '800' }}>Welcome back, {user?.name?.split(' ')[0] || 'Architect'}.</h1>
                    <p style={{ opacity: 0.8, marginTop: '8px', fontSize: '1.1rem', maxWidth: '600px' }}>
                        Your dashboard is live. You have {stats.bookings} active bookings and {stats.approvals} requests waiting for approval.
                    </p>
                </div>
                <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
            </div>

            {/* KPI Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'MY BOOKINGS', val: stats.bookings, color: '#ea580c', tag: 'ACTIVE', icon: '📅' },
                    { label: 'OPEN TICKETS', val: stats.tickets, color: '#1e293b', tag: 'LIVE', icon: '🎫' },
                    { label: 'PENDING APPROVALS', val: stats.approvals, color: '#ea580c', tag: 'URGENT', icon: '⚖️' },
                    { label: 'NOTIFICATIONS', val: stats.notifications, color: '#1e293b', tag: 'NEW', icon: '🔔' }
                ].map((kpi, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>{kpi.icon}</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>{kpi.label}</span>
                            </div>
                            <span style={{ color: kpi.color, fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: `${kpi.color}10`, padding: '4px 8px', borderRadius: '6px' }}>{kpi.tag}</span>
                        </div>
                        <h2 style={{ fontSize: '2.2rem', margin: 0, color: '#1e293b', fontWeight: '800' }}>{String(kpi.val).padStart(2, '0')}</h2>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                
                {/* Dynamic Activity Feed */}
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>Recent Activity Feed</h3>
                        <button style={{ background: 'none', border: 'none', color: '#9a3412', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>VIEW ALL HISTORY</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#f1f5f9' }}></div>
                        {stats.recentActivity.length > 0 ? stats.recentActivity.map((act, i) => (
                            <div key={i} style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 2 }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: 'white', border: '2px solid #f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{act.icon}</div>
                                <div>
                                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>{act.title}</h4>
                                    <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>{act.desc}</p>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{act.time}</span>
                                </div>
                            </div>
                        )) : <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No recent activity to show.</p>}
                    </div>
                </div>

                {/* mini Calendar / Upcoming */}
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '24px', color: '#1e293b', fontSize: '1.1rem' }}>Upcoming Bookings</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '32px', textAlign: 'center' }}>
                        {['S','M','T','W','T','F','S'].map((day, i) => (
                            <div key={i} style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8' }}>{day}</div>
                        ))}
                        {currentDates.map((date, i) => (
                            <div key={i} style={{ 
                                padding: '10px 0', borderRadius: '10px', fontSize: '0.9rem',
                                backgroundColor: date === today.getDate() ? '#1e293b' : 'transparent',
                                color: date === today.getDate() ? 'white' : '#1e293b',
                                fontWeight: date === today.getDate() ? 'bold' : '600'
                            }}>{date}</div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {stats.upcoming.length > 0 ? stats.upcoming.map((ub, i) => (
                            <div key={i} style={{ borderLeft: `4px solid ${i === 0 ? '#ea580c' : '#334155'}`, paddingLeft: '16px' }}>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b' }}>{ub.resource?.name}</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                    {new Date(ub.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {ub.resource?.location || 'Campus'}
                                </p>
                            </div>
                        )) : <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No sessions scheduled soon.</p>}
                    </div>

                    <button 
                        onClick={() => navigate('/bookings')}
                        style={{ width: '100%', marginTop: '32px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#1e293b', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                    >
                        Open Full Calendar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;