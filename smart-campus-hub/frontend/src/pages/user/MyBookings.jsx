import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/bookings');
            const allBookings = res.data || [];
            // CRITICAL: Filter for this user only
            const myBookings = allBookings.filter(b => b.userId === user?.id || b.user?.id === user?.id);
            setBookings(myBookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch user bookings:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBookings();
            const intervalId = setInterval(fetchBookings, 10000);
            return () => clearInterval(intervalId);
        }
    }, [user]);

    const cancelBooking = async (id) => {
        const prev = [...bookings];
        setBookings(prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
        try {
            // Reusing the @RequestParam approach discovered earlier
            await api.put(`/api/bookings/${id}/status`, null, { params: { status: 'CANCELLED' } });
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            alert('Cancellation failed. Reverting...');
            setBookings(prev);
            fetchBookings();
        }
    };

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        const matchesTab = activeTab === 'All' || b.status === activeTab.toUpperCase();
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            b.resource?.name?.toLowerCase().includes(searchLower) ||
            b.purpose?.toLowerCase().includes(searchLower);
        return matchesTab && matchesSearch;
    });

    // KPI Calculations
    const approvedBookings = bookings.filter(b => b.status === 'APPROVED');
    
    // Total Hours
    const totalHours = approvedBookings.reduce((sum, b) => {
        if (!b.startTime || !b.endTime) return sum;
        const diffMs = new Date(b.endTime) - new Date(b.startTime);
        return sum + (diffMs / (1000 * 60 * 60));
    }, 0);

    // Active Requests
    const activeRequests = bookings.filter(b => b.status === 'PENDING').length;

    // Next Reservation
    const upcomingApproved = approvedBookings
        .filter(b => new Date(b.startTime) > new Date())
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const nextRes = upcomingApproved.length > 0 ? upcomingApproved[0] : null;

    // Formatting Helpers
    const formatDateTime = (start, end) => {
        if (!start) return { date: 'N/A', time: 'N/A' };
        const d = new Date(start);
        const e = end ? new Date(end) : null;
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: `${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}${e ? ' - ' + e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}`
        };
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { bg: '#ecfdf5', color: '#059669', border: '#e2e8f0' };
            case 'PENDING': return { bg: '#fffbeb', color: '#d97706', border: '#e2e8f0' };
            case 'REJECTED': return { bg: '#fef2f2', color: '#dc2626', border: '#e2e8f0' };
            case 'CANCELLED': return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
            default: return { bg: '#f8fafc', color: '#334155', border: '#e2e8f0' };
        }
    };

    const formatNextResTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        if (d.toDateString() === today.toDateString()) return `Today, ${timeStr}`;
        if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${timeStr}`;
        return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
    };

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>My Bookings</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '1rem' }}>Manage your campus resource reservations and requests.</p>
                </div>
                <button style={{ 
                    backgroundColor: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '8px', 
                    padding: '10px 20px', fontWeight: '600', cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                }}>
                    + NEW REQUEST
                </button>
            </div>

            {/* Main Content Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px' }}>
                
                {/* Tabs & Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', padding: '0 24px', backgroundColor: '#f8fafc', flexWrap: 'wrap', gap: '16px' }}>
                    
                    <div style={{ display: 'flex', gap: '32px' }}>
                        {['All', 'Pending', 'Approved', 'Cancelled'].map(tab => (
                            <div 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                style={{ 
                                    padding: '20px 0', 
                                    cursor: 'pointer', 
                                    fontWeight: activeTab === tab ? '700' : '500', 
                                    color: activeTab === tab ? '#0f172a' : '#64748b',
                                    borderBottom: activeTab === tab ? '3px solid #0f172a' : '3px solid transparent',
                                    transition: '0.2s',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0' }}>
                        <input 
                            type="text" 
                            placeholder="Search requests..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', width: '220px', fontSize: '0.95rem', color: '#334155' }}
                        />
                        <button style={{ padding: '10px 16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                            Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purpose</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Loading your reservations...</td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>No bookings match your current view.</td></tr>
                            ) : (
                                filteredBookings.map(booking => {
                                    const { date, time } = formatDateTime(booking.startTime, booking.endTime);
                                    const statusStyle = getStatusStyle(booking.status);
                                    
                                    return (
                                        <tr key={booking.id} style={{ borderBottom: '1px solid #e2e8f0', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                                                        {booking.resource?.name?.substring(0,2).toUpperCase() || 'RS'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>{booking.resource?.name || 'Unknown Resource'}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>{booking.resource?.location || `ID: ${booking.resourceId || 'N/A'}`}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '500', color: '#334155', fontSize: '0.95rem' }}>{date}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>{time}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ color: '#334155', fontSize: '0.95rem', fontWeight: '500', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {booking.purpose || 'No purpose specified'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ 
                                                    backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                                                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase'
                                                }}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                                                    <button 
                                                        onClick={() => cancelBooking(booking.id)}
                                                        style={{ 
                                                            padding: '6px 16px', backgroundColor: '#ffffff', color: '#dc2626', 
                                                            border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', 
                                                            fontSize: '0.95rem', cursor: 'pointer', transition: '0.2s'
                                                        }}
                                                        onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626'; }}
                                                        onMouseOut={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                                    >
                                                        CANCEL
                                                    </button>
                                                )}
                                                {booking.status !== 'APPROVED' && booking.status !== 'PENDING' && (
                                                    <span style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KPI Cards (Bottom) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TOTAL HOURS</p>
                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>{totalHours.toFixed(1)} <span style={{fontSize: '0.95rem', color: '#64748b', fontWeight: '500'}}>hrs</span></h2>
                </div>
                
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>ACTIVE REQUESTS</p>
                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#ea580c', letterSpacing: '-0.025em' }}>{activeRequests}</h2>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>UTILIZATION RATE</p>
                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>82%</h2>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', color: '#ffffff', border: '1px solid #0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>NEXT RESERVATION</p>
                    {nextRes ? (
                        <>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>{nextRes.resource?.name || 'Campus Resource'}</h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#f8fafc', fontWeight: '500' }}>{formatNextResTime(nextRes.startTime)}</p>
                        </>
                    ) : (
                        <>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#64748b' }}>No Upcoming</h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>-</p>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default MyBookings;
