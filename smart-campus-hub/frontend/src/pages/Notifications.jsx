import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        if (!user?.id) return;
        try {
            const response = await api.get(`/api/notifications?userId=${user.id}`);
            setNotifications(response.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await api.put(`/api/notifications/read-all?userId=${user.id}`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
        } catch (err) {
            console.error('Error marking notifications as read:', err);
            alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getIconColor = (type) => {
        if (!type) return '#64748B'; 
        if (type.toUpperCase() === 'BOOKING') return 'var(--sliit-orange, #f97316)';
        if (type.toUpperCase() === 'TICKET') return 'var(--sliit-navy, #0f172a)';
        return '#10B981'; 
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            {error && <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            <div style={{ background: 'var(--white, #ffffff)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <header style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 600 }}>Your Notifications</h1>
                    <button
                        onClick={handleMarkAllAsRead}
                        style={{ padding: 0, backgroundColor: 'transparent', color: 'var(--sliit-navy, #0f172a)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'opacity 0.2s' }}
                        onMouseOver={(e) => e.target.style.opacity = '0.8'}
                        onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                        Mark All as Read
                    </button>
                </header>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <p style={{ margin: 0 }}>You're all caught up! No notifications right now.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {notifications.map(notif => {
                            const isRead = notif.isRead || notif.read;
                            const notifType = notif.type || (notif.message.toLowerCase().includes('booking') ? 'BOOKING' : notif.message.toLowerCase().includes('ticket') ? 'TICKET' : 'SYSTEM');

                            return (
                                <div key={notif.id} style={{ 
                                    padding: '20px 24px', 
                                    borderBottom: '1px solid #e5e7eb', 
                                    display: 'flex', 
                                    alignItems: 'flex-start',
                                    gap: '16px',
                                    backgroundColor: isRead ? 'transparent' : '#F8FAFC',
                                    position: 'relative',
                                    transition: 'background-color 0.2s'
                                }}>
                                    {!isRead && (
                                        <div style={{ position: 'absolute', top: '28px', left: '10px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--sliit-navy, #0f172a)' }} />
                                    )}
                                    
                                    <div style={{ 
                                        width: '40px', height: '40px', borderRadius: '50%', 
                                        backgroundColor: `${getIconColor(notifType)}20`, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getIconColor(notifType) }} />
                                    </div>
                                    
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: isRead ? '400' : '500', lineHeight: '1.4' }}>
                                            {notif.message}
                                        </p>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            {formatTimeAgo(notif.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
