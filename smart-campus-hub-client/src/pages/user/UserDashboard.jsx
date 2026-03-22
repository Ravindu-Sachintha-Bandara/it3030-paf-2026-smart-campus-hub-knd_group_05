import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { notificationService } from '../../services/notificationService';
import apiClient from '../../services/apiClient';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Student');
    const [bookings, setBookings] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Decode username from token
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.sub) {
                    setUserName(payload.sub);
                } else if (payload.username) {
                    setUserName(payload.username);
                }
            } catch (e) {
                console.warn('Could not decode token for username', e);
            }
        }

        const fetchData = async () => {
            try {
                const [bookingsData, notifData, ticketsRes] = await Promise.all([
                    bookingService.getMyBookings().catch(() => []),
                    notificationService.fetchNotifications(false).catch(() => []),
                    apiClient.get('/tickets/my').then(res => res.data).catch(() => [])
                ]);

                setBookings(bookingsData || []);
                setNotifications(notifData || []);
                setTickets(ticketsRes || []);
            } catch (err) {
                console.error("Error loading dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate dynamic stats
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const openTickets = tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    
    // Recent activity feed uses notifications
    const recentActivity = notifications.slice(0, 5);
    
    // Sort and filter upcoming bookings
    const upcomingBookingsList = bookings
        .filter(b => b.status === 'APPROVED' && new Date(b.startTime) > new Date())
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 2);

    const activeRequestsTotal = pendingBookings + openTickets;

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your portal...</div>;
    }

    return (
        <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', fontFamily: 'var(--font-family)', color: 'var(--text-primary)' }}>
            
            {/* Welcome Banner */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '32px', color: 'white', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 700 }}>Welcome back, {userName}.</h1>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '1.1rem' }}>
                    Your academic ecosystem is healthy. You have <strong style={{ color: 'white' }}>{activeRequestsTotal}</strong> active requests today.
                </p>
            </div>

            {/* KPI Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
                {[
                    { title: 'My Bookings', value: bookings.length, trend: '+12%', icon: '📅' },
                    { title: 'Open Tickets', value: openTickets, trend: '-5%', icon: '🛠️' },
                    { title: 'Pending Approvals', value: pendingBookings, trend: '+2%', icon: '⏳' },
                    { title: 'Notifications', value: notifications.length, trend: 'New', icon: '🔔' }
                ].map((kpi, i) => (
                    <div key={i} className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ fontSize: '1.5rem', backgroundColor: '#f1f5f9', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                {kpi.icon}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: kpi.trend.startsWith('+') || kpi.trend === 'New' ? '#10b981' : '#ef4444', backgroundColor: kpi.trend.startsWith('+') || kpi.trend === 'New' ? '#d1fae5' : '#fee2e2', padding: '4px 8px', borderRadius: '999px' }}>
                                {kpi.trend}
                            </span>
                        </div>
                        <h3 style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, margin: '0 0 8px 0' }}>{kpi.title}</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', lineHeight: 1 }}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Split Layout Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                
                {/* Recent Activity Feed (Left Column) */}
                <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 24px 0', fontWeight: 600, color: '#0f172a' }}>Recent Activity Feed</h2>
                    
                    <div style={{ position: 'relative', paddingLeft: '24px' }}>
                        {/* Vertical Line */}
                        <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '0', width: '2px', backgroundColor: '#e2e8f0' }}></div>
                        
                        {recentActivity.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent activity to display.</p>
                        ) : (
                            recentActivity.map((activity, i) => (
                                <div key={i} style={{ position: 'relative', marginBottom: '24px' }}>
                                    {/* Timeline Dot */}
                                    <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--sidebar-bg, #1e293b)', border: '2px solid white', boxShadow: '0 0 0 2px var(--sidebar-bg, #1e293b)' }}></div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                                                {activity.relatedEntityType === 'BOOKING' ? 'Booking Update' : activity.relatedEntityType === 'TICKET' ? 'Ticket Update' : 'System Notification'}
                                            </h3>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{activity.message}</p>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                            {new Date(activity.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mini Calendar / Upcoming (Right Column) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                             <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600, color: '#0f172a' }}>Upcoming Bookings</h2>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 {upcomingBookingsList.length > 0 && upcomingBookingsList.some(b => b.isUrgent) && (
                                    <span className="badge" style={{ backgroundColor: 'var(--accent-orange, #f97316)', color: 'white' }}>URGENT</span>
                                 )}
                                 <button onClick={() => navigate('/user/calendar')} className="btn" style={{ backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '0.8rem', padding: '6px 12px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Open Full Calendar</button>
                             </div>
                        </div>
                        
                        {/* Mini Calendar Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '16px', textAlign: 'center' }}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{day}</div>
                            ))}
                        </div>
                        
                        {/* Mini Calendar Days (Static week view representation) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '24px', textAlign: 'center' }}>
                            {[20, 21, 22, 23, 24, 25, 26].map((date, i) => (
                                <div key={i} style={{ 
                                    fontSize: '0.85rem', fontWeight: 600, 
                                    color: date === 24 ? 'white' : '#1e293b', 
                                    backgroundColor: date === 24 ? 'var(--sidebar-bg, #1e293b)' : 'transparent',
                                    borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto'
                                }}>
                                    {date}
                                </div>
                            ))}
                        </div>

                        {/* Upcoming List */}
                        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 16px 0' }}>Next Appointments</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingBookingsList.length === 0 ? (
                                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                     <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No upcoming bookings soon.</p>
                                </div>
                            ) : (
                                upcomingBookingsList.map((booking, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'var(--accent-orange, #f97316)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{new Date(booking.startTime).toLocaleString('default', { month: 'short' })}</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{new Date(booking.startTime).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{booking.resource?.name || 'Academic Session'}</h4>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                                                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDashboard;
