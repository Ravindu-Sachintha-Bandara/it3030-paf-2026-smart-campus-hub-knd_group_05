import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [resourceId, setResourceId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const fetchBookings = async () => {
        if (!user) return;
        try {
            const response = await api.get(`/api/bookings?userId=${user.id}`);
            setBookings(response.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load your bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/api/bookings?userId=${user.id}`, {
                resourceId: parseInt(resourceId, 10),
                purpose,
                startTime,
                endTime
            });
            setResourceId('');
            setPurpose('');
            setStartTime('');
            setEndTime('');
            fetchBookings();
        } catch (err) {
            console.error('Error creating booking:', err);
            alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
        }
    };

    const handleCancel = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await api.delete(`/api/bookings/${bookingId}`);
                fetchBookings();
            } catch (err) {
                console.error('Error canceling booking:', err);
                alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
            }
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Bookings</h1>
            </header>

            <div className="card-container" style={{ marginBottom: '30px' }}>
                <h2 style={{ top: 0, marginTop: 0, fontSize: '1.2em', color: '#444' }}>Create Booking</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Resource ID</label>
                        <input type="number" required value={resourceId} onChange={(e) => setResourceId(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="e.g. 5" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '2', minWidth: '200px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Purpose</label>
                        <input type="text" required value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Meeting purpose" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '180px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Start Time</label>
                        <input type="datetime-local" required value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '180px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>End Time</label>
                        <input type="datetime-local" required value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '62px' }}>
                        <button type="submit" className="btn-primary">Book Now</button>
                    </div>
                </form>
            </div>

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
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                                            Cancel
                                        </button>
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

export default UserBookings;
