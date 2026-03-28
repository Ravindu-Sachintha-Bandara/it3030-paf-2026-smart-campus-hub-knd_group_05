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
                    type: 'booking',
                    resourceName: b.resource?.name || 'Unknown',
                    status: b.status,
                    time: 'Recent', 
                    icon: b.status === 'APPROVED' ? '✅' : '⏳' 
                })),
                ...myRawTickets.map(t => ({ 
                    title: 'Ticket Status', 
                    type: 'ticket',
                    ticketId: t.id.toString().slice(-4),
                    status: t.status,
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
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* Welcome Banner */}
            <div style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                padding: '40px', borderRadius: '12px', color: '#ffffff', marginBottom: '32px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: '800', letterSpacing: '-0.025em' }}>Welcome back, {user?.name?.split(' ')[0] || 'Architect'}.</h1>
                    <p style={{ opacity: 0.9, marginTop: '8px', fontSize: '1.05rem', maxWidth: '600px', fontWeight: '500', color: '#f8fafc' }}>
                        Your dashboard is live. You have {stats.bookings} active bookings and {stats.approvals} requests waiting for approval.
                    </p>
                </div>
                <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
            </div>

            {/* KPI Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {[
                    { label: 'MY BOOKINGS', val: stats.bookings, color: '#0f172a', tag: 'ACTIVE', icon: '📅', tagColor: '#059669', tagBg: '#ecfdf5' },
                    { label: 'OPEN TICKETS', val: stats.tickets, color: '#0f172a', tag: 'LIVE', icon: '🎫', tagColor: '#2563eb', tagBg: '#eff6ff' },
                    { label: 'PENDING APPROVALS', val: stats.approvals, color: '#ea580c', tag: 'URGENT', icon: '⚖️', tagColor: '#d97706', tagBg: '#fffbeb' },
                    { label: 'NOTIFICATIONS', val: stats.notifications, color: '#0f172a', tag: 'NEW', icon: '🔔', tagColor: '#dc2626', tagBg: '#fef2f2' }
                ].map((kpi, i) => (
                    <div key={i} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.25rem' }}>{kpi.icon}</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                            </div>
                            <span style={{ color: kpi.tagColor, backgroundColor: kpi.tagBg, fontSize: '0.7rem', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>{kpi.tag}</span>
                        </div>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, color: kpi.color, fontWeight: '800', letterSpacing: '-0.025em' }}>{String(kpi.val).padStart(2, '0')}</h2>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                
                {/* Dynamic Activity Feed */}
                <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>Recent Activity Feed</h3>
                        <button onClick={() => navigate('/bookings')} style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#c2410c'} onMouseOut={(e) => e.currentTarget.style.color = '#ea580c'}>VIEW ALL HISTORY</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#e2e8f0' }}></div>
                        {stats.recentActivity.length > 0 ? stats.recentActivity.map((act, i) => (
                            <div key={i} style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 2 }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1.25rem' }}>{act.icon}</span>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: '600' }}>{act.title}</h4>
                                    <p style={{ margin: '4px 0', fontSize: '0.95rem', color: '#334155', fontWeight: '500' }}>
                                        {act.type === 'booking' ? `Resource ${act.resourceName} is ${act.status}` : `Ticket #${act.ticketId} is ${act.status}`}
                                    </p>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{act.time}</span>
                                </div>
                            </div>
                        )) : <p style={{ color: '#64748b', fontStyle: 'italic', fontWeight: '500', fontSize: '0.95rem' }}>No recent activity to show.</p>}
                    </div>
                </div>

                {/* mini Calendar / Upcoming */}
                <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                    <h3 style={{ marginBottom: '24px', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 24px 0' }}>Upcoming Bookings</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '32px', textAlign: 'center' }}>
                        {['S','M','T','W','T','F','S'].map((day, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{day}</div>
                        ))}
                        {currentDates.map((date, i) => (
                            <div key={i} style={{ 
                                padding: '10px 0', borderRadius: '8px', fontSize: '0.95rem',
                                backgroundColor: date === today.getDate() ? '#ea580c' : 'transparent',
                                color: date === today.getDate() ? '#ffffff' : '#334155',
                                fontWeight: date === today.getDate() ? '700' : '600'
                            }}>{date}</div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {stats.upcoming.length > 0 ? stats.upcoming.map((ub, i) => (
                            <div key={i} style={{ borderLeft: '4px solid', borderColor: i === 0 ? '#ea580c' : '#0f172a', paddingLeft: '16px' }}>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{ub.resource?.name}</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                                    {new Date(ub.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {ub.resource?.location || 'Campus'}
                                </p>
                            </div>
                        )) : <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>No sessions scheduled soon.</p>}
                    </div>

                    <button 
                        onClick={() => navigate('/user/calendar')}
                        style={{ width: '100%', marginTop: '32px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
                    >
                        Open Full Calendar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;