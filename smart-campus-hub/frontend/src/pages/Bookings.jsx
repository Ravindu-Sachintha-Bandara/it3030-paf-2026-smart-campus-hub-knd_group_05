import React, { useEffect, useState } from 'react';
import api from '../services/api';

const timeOptions = (() => {
    const options = [];
    for (let i = 8; i <= 23; i++) {
        for (let j = 0; j < 60; j += 30) {
            if (i === 23 && j > 0) continue;
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            options.push(`${hour}:${minute}`);
        }
    }
    return options;
})();

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [loggedInUser, setLoggedInUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/api/users/me');
                setLoggedInUser(response.data);
            } catch (err) {
                console.error("Error fetching user data", err);
            } finally {
                setUserLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Form state
    const [resourceId, setResourceId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [date, setDate] = useState('');
    const [startTimeStr, setStartTimeStr] = useState('');
    const [endTimeStr, setEndTimeStr] = useState('');
    const [resources, setResources] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await api.get('/api/resources');
                setResources(response.data);
            } catch (err) {
                console.error("Error fetching resources", err);
            }
        };
        fetchResources();
    }, []);

    const fetchBookings = async () => {
        if (!loggedInUser) return;
        try {
            let endpoint = '/api/bookings';
            if (loggedInUser.role === 'USER') {
                endpoint = `/api/bookings?userId=${loggedInUser.id}`;
            }
            const response = await api.get(endpoint);
            setBookings(response.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loggedInUser) {
            fetchBookings();
        }
    }, [loggedInUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null); // Clear previous errors
        try {
            const startDateTime = `${date}T${startTimeStr}:00`;
            const endDateTime = `${date}T${endTimeStr}:00`;
            const userId = loggedInUser ? loggedInUser.id : 1;
            await api.post(`/api/bookings?userId=${userId}`, {
                resourceId: parseInt(resourceId, 10),
                purpose,
                startTime: startDateTime,
                endTime: endDateTime
            });
            // Clear form
            setResourceId('');
            setPurpose('');
            setDate('');
            setStartTimeStr('');
            setEndTimeStr('');
            // Refresh table
            fetchBookings();
        } catch (err) {
            console.error('Error creating booking:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred while creating your booking.';
            setErrorMessage(msg);
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

    if (userLoading) {
        return <p>Loading user data...</p>;
    }

    return (
        <div>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Bookings</h1>
            </header>

            {/* Create Booking Form */}
            {loggedInUser?.role !== 'ADMIN' && (
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #e9ecef' }}>
                <h2 style={{ top: 0, marginTop: 0, fontSize: '1.2em', color: '#444', marginBottom: '16px' }}>Create Booking</h2>
                
                {errorMessage && (
                    <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: '500', fontSize: '0.95rem' }}>
                        {errorMessage}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Resource</label>
                        <select
                            required
                            value={resourceId}
                            onChange={(e) => { setResourceId(e.target.value); setErrorMessage(null); }}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
                        >
                            <option value="">Select Resource</option>
                            {resources.map(res => (
                                <option key={res.id} value={res.id}>{res.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '2', minWidth: '200px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Purpose</label>
                        <input
                            type="text"
                            required
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            placeholder="Meeting purpose"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => { setDate(e.target.value); setErrorMessage(null); }}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', color: 'var(--sliit-navy)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '120px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Start Time</label>
                        <select
                            required
                            value={startTimeStr}
                            onChange={(e) => { setStartTimeStr(e.target.value); setErrorMessage(null); }}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', color: 'var(--sliit-navy)', backgroundColor: 'white' }}
                        >
                            <option value="">Select Time</option>
                            {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '120px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>End Time</label>
                        <select
                            required
                            value={endTimeStr}
                            onChange={(e) => { setEndTimeStr(e.target.value); setErrorMessage(null); }}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', color: 'var(--sliit-navy)', backgroundColor: 'white' }}
                        >
                            <option value="">Select Time</option>
                            {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '62px' }}>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Book Now
                        </button>
                    </div>
                </form>
            </div>
            )}

            {error && <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {/* Admin Filter Row */}
            {loggedInUser?.role === 'ADMIN' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Filter by Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', color: 'var(--sliit-navy)', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none' }}
                    >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            )}

            {loading ? (
                <p>Loading bookings...</p>
            ) : bookings.length > 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
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
                            {bookings
                                .filter(b => statusFilter === 'ALL' || b.status.toUpperCase() === statusFilter)
                                .map(booking => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #e9ecef', ':hover': { backgroundColor: '#f8f9fa' } }}>
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
                                        {loggedInUser?.role === 'ADMIN' ? (
                                            <>
                                                {booking.status === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleApprove(booking.id)}
                                                            style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(booking.id)}
                                                            style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                                                Cancel
                                            </button>
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

export default Bookings;
