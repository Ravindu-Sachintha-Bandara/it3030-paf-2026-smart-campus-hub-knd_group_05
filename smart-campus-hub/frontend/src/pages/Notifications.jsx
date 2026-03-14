import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications?userId=1');
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
    }, []);

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/api/notifications/read-all?userId=1');
            fetchNotifications();
        } catch (err) {
            console.error('Error marking notifications as read:', err);
            alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Notifications</h1>
                <button
                    onClick={handleMarkAllAsRead}
                    style={{ padding: '8px 16px', backgroundColor: '#e2e3e5', color: '#383d41', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Mark All as Read
                </button>
            </header>

            {error && <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {loading && <p>Loading notifications...</p>}

            {!loading && notifications.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', color: '#666' }}>
                    <p>No notifications found.</p>
                </div>
            )}

            {!loading && notifications.length > 0 && (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', textTransform: 'uppercase', fontSize: '13px', color: '#555', borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ padding: '15px', textAlign: 'left', width: '60%' }}>Message</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Created At</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map(notification => (
                                <tr key={notification.id} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: notification.read ? 'transparent' : '#f0f8ff' }}>
                                    <td style={{ padding: '15px', color: '#333', fontWeight: notification.read ? 'normal' : 'bold' }}>
                                        {notification.message}
                                    </td>
                                    <td style={{ padding: '15px', color: '#666' }}>
                                        {formatDate(notification.createdAt)}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        {notification.read ? (
                                            <span style={{ color: '#6c757d', fontSize: '0.9em' }}>Read</span>
                                        ) : (
                                            <span style={{
                                                padding: '3px 8px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold',
                                                backgroundColor: '#007bff', color: 'white'
                                            }}>
                                                New
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Notifications;
