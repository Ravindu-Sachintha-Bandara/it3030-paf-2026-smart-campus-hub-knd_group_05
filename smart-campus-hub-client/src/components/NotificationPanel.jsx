import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
        // Simulate real-time polling every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            // Fetch all notifications to show history, but compute unread count
            const data = await notificationService.fetchNotifications(false);
            setNotifications(data);
            const unread = data.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('Could not load notifications', err);
        }
    };

    const handleMarkAsRead = async (id, isRead) => {
        if (isRead) return; // Already read
        try {
            await notificationService.markAsRead(id);
            // Update local state optimizing UI refresh
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all read");
        }
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, fontFamily: 'sans-serif' }}>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px', height: '60px', borderRadius: '30px', backgroundColor: '#3f51b5',
                    color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px',
                    position: 'relative'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '0', right: '0', backgroundColor: '#f44336',
                        color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px',
                        fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Pop-out Panel */}
            {isOpen && (
                <div style={{
                    position: 'absolute', bottom: '80px', right: '0', width: '350px', maxHeight: '500px',
                    backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}>

                    {/* Header */}
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} style={{ fontSize: '12px', border: 'none', background: 'none', color: '#007bff', cursor: 'pointer' }}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ overflowY: 'auto', padding: '0', margin: '0' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No notifications yet.</div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleMarkAsRead(notif.id, notif.read)}
                                    style={{
                                        padding: '15px',
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: notif.read ? 'white' : '#eef2ff',
                                        cursor: notif.read ? 'default' : 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
                                        {notif.message}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
                                        <span>{notif.relatedEntityType === 'BOOKING' ? '📅 Booking' : '🛠️ Ticket'}</span>
                                        <span>{formatDate(notif.createdAt)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
