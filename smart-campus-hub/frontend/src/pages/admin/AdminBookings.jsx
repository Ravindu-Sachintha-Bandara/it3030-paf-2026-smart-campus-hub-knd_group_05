import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBookings = async () => {
        try {
            const response = await api.get('/api/bookings');
            setBookings(response.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleApprove = async (bookingId) => {
        try {
            await api.put(`/api/bookings/${bookingId}/approve`);
            fetchBookings();
        } catch (err) {
            console.error('Error approving booking:', err);
            alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
        }
    };

    const handleReject = async (bookingId) => {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await api.put(`/api/bookings/${bookingId}/reject`, { reason });
            fetchBookings();
        } catch (err) {
            console.error('Error rejecting booking:', err);
            alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderStatusBadge = (status) => {
        let bg, text;
        switch (status) {
            case 'APPROVED':
                bg = '#e6f4ea';
                text = '#1e8e3e';
                break;
            case 'PENDING':
                bg = 'rgba(232, 160, 32, 0.15)';
                text = 'var(--sliit-gold)';
                break;
            case 'REJECTED':
                bg = '#fce8e6';
                text = '#d93025';
                break;
            default:
                bg = '#f1f3f4';
                text = '#5f6368';
        }
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: bg,
                color: text,
                display: 'inline-block'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: 'var(--sliit-dark-navy)' }}>All Bookings (Admin)</h1>
            </header>

            {error && <div style={{ padding: '15px', backgroundColor: '#fce8e6', color: '#d93025', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {loading ? (
                <p>Loading bookings...</p>
            ) : (
                <div style={{
                    background: 'var(--white)',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                    {bookings && bookings.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>ID</th>
                                        <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>User</th>
                                        <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Resource</th>
                                        <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Date &amp; Time</th>
                                        <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Purpose</th>
                                        <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Status</th>
                                        <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.id} style={{ borderBottom: '1px solid var(--sliit-light-bg)' }}>
                                            <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-dark-navy)', fontWeight: '500' }}>#{booking.id}</td>
                                            <td style={{ padding: '16px 15px 16px 0' }}>{booking.userId != null ? `User ${booking.userId}` : (booking.user?.name || booking.user?.email || 'N/A')}</td>
                                            <td style={{ padding: '16px 15px 16px 0' }}>{booking.resourceId != null ? `Resource ${booking.resourceId}` : (booking.resource?.name || 'N/A')}</td>
                                            <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-gray)', fontSize: '0.9rem' }}>
                                                <div>{formatDate(booking.startTime)}</div>
                                                <div style={{ color: '#888', fontSize: '0.8rem' }}>to {formatDate(booking.endTime)}</div>
                                            </td>
                                            <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-gray)' }}>{booking.purpose || 'N/A'}</td>
                                            <td style={{ padding: '16px 15px 16px 0' }}>{renderStatusBadge(booking.status)}</td>
                                            <td style={{ padding: '16px 0', textAlign: 'center' }}>
                                                {booking.status === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleApprove(booking.id)}
                                                            style={{
                                                                padding: '6px 16px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600',
                                                                color: '#1e8e3e',
                                                                backgroundColor: 'transparent',
                                                                border: '1px solid #1e8e3e',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(booking.id)}
                                                            style={{
                                                                padding: '6px 16px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600',
                                                                color: '#d93025',
                                                                backgroundColor: 'transparent',
                                                                border: '1px solid #d93025',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--sliit-gray)', padding: '20px' }}>
                            <p>No bookings found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBookings;
