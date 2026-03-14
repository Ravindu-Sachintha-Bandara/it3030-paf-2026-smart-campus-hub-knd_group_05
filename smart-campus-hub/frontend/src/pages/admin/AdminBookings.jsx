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

    return (
        <div>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>All Bookings (Admin)</h1>
            </header>

            {error && <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {loading ? (
                <p>Loading bookings...</p>
            ) : bookings.length > 0 ? (
                <div className="card-container" style={{ overflow: 'x-auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', textTransform: 'uppercase', fontSize: '13px', color: '#555', borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Resource ID</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Start Time</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>End Time</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td style={{ padding: '15px', color: '#333' }}>#{booking.id}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>Resource {booking.resourceId}</td>
                                    <td style={{ padding: '15px', color: '#666' }}>{formatDate(booking.startTime)}</td>
                                    <td style={{ padding: '15px', color: '#666' }}>{formatDate(booking.endTime)}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold',
                                            backgroundColor: booking.status === 'APPROVED' ? '#d4edda' : booking.status === 'PENDING' ? '#fff3cd' : '#f8d7da',
                                            color: booking.status === 'APPROVED' ? '#155724' : booking.status === 'PENDING' ? '#856404' : '#721c24'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        {booking.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleApprove(booking.id)}
                                                    className="btn-primary"
                                                    style={{ padding: '6px 12px', fontSize: '0.85em' }}>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(booking.id)}
                                                    style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
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
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', color: '#666' }}>
                    <p>No bookings found.</p>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;
