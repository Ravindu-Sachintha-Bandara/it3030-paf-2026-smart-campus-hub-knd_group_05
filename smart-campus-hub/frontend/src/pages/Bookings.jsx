import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Bookings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchMyBookings = async () => {
        try {
            const response = await api.get('/api/bookings');
            // Filter strictly for this logged-in user
            const myBookings = (response.data || []).filter(b => b.userId === user?.id || b.user?.id === user?.id);
            // Sort newest first
            myBookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            setBookings(myBookings);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching my bookings:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBookings();
        const interval = setInterval(fetchMyBookings, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const cancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this request?")) return;
        try {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
            await api.put(`/api/bookings/${id}/status`, { status: 'CANCELLED' });
        } catch (error) {
            console.error("Failed to cancel", error);
            fetchMyBookings();
        }
    };

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              b.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'All' || b.status.toUpperCase() === activeTab.toUpperCase();
        return matchesSearch && matchesTab;
    });

    // Helper formatting
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#111827', fontWeight: '900', letterSpacing: '-0.5px' }}>My Bookings</h1>
                    <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '1rem', maxWidth: '600px', lineHeight: '1.5' }}>
                        Manage your academic facility reservations, track approval statuses, and handle scheduling conflicts from your personal dashboard.
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/bookings/new')}
                    style={{ 
                    backgroundColor: '#ea580c', color: 'white', padding: '12px 24px', borderRadius: '8px', 
                    border: 'none', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>+</span> NEW REQUEST
                </button>
            </div>

            {/* Controls Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                    {['All', 'Pending', 'Approved', 'Cancelled'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '8px 24px', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                                color: activeTab === tab ? '#111827' : '#64748b',
                                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search & Filter */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Search resources..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px 16px', width: '250px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.9rem' }}
                    />
                    <button style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>≡</span> Filters
                    </button>
                </div>
            </div>

            {/* Main Table Area */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden', marginBottom: '32px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                                <th style={{ padding: '20px 24px', color: '#374151', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>RESOURCE</th>
                                <th style={{ padding: '20px 24px', color: '#374151', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>DATE</th>
                                <th style={{ padding: '20px 24px', color: '#374151', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>TIME</th>
                                <th style={{ padding: '20px 24px', color: '#374151', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>PURPOSE</th>
                                <th style={{ padding: '20px 24px', color: '#374151', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>STATUS</th>
                                <th style={{ padding: '20px 24px', color: '#374151', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading your bookings...</td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>No bookings found.</td></tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                        
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                    🏢
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: '700', color: '#111827', fontSize: '0.95rem' }}>{booking.resource?.name || `Resource #${booking.resourceId}`}</p>
                                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>{booking.resource?.location || 'Campus Facility'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '20px 24px' }}>
                                            <p style={{ margin: 0, color: '#374151', fontWeight: '500', fontSize: '0.9rem' }}>{formatDate(booking.startTime)}</p>
                                        </td>

                                        <td style={{ padding: '20px 24px' }}>
                                            <p style={{ margin: 0, color: '#374151', fontWeight: '500', fontSize: '0.9rem' }}>{formatTime(booking.startTime)} -<br/>{formatTime(booking.endTime)}</p>
                                        </td>

                                        <td style={{ padding: '20px 24px', maxWidth: '200px' }}>
                                            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', fontStyle: 'italic' }}>{booking.purpose || 'No purpose stated'}</p>
                                        </td>

                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ 
                                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px',
                                                backgroundColor: booking.status === 'PENDING' ? '#fff7ed' : booking.status === 'APPROVED' ? '#ecfdf5' : booking.status === 'CANCELLED' ? '#f3f4f6' : '#fef2f2',
                                                color: booking.status === 'PENDING' ? '#ea580c' : booking.status === 'APPROVED' ? '#059669' : booking.status === 'CANCELLED' ? '#6b7280' : '#dc2626'
                                            }}>
                                                {booking.status}
                                            </span>
                                        </td>

                                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                            {(booking.status === 'PENDING' || booking.status === 'APPROVED') ? (
                                                <button onClick={() => cancelBooking(booking.id)} style={{ padding: '6px 16px', backgroundColor: 'white', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>
                                                    CANCEL
                                                </button>
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No Actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Showing {filteredBookings.length} bookings</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '6px 16px', border: '1px solid #e5e7eb', backgroundColor: 'white', borderRadius: '6px', color: '#4b5563', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>Previous</button>
                        <button style={{ padding: '6px 16px', border: '1px solid #e5e7eb', backgroundColor: 'white', borderRadius: '6px', color: '#4b5563', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>Next</button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Bookings;