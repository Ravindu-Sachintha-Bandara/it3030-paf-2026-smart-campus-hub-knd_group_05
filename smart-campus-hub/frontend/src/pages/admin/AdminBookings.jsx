import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/bookings');
            setBookings(res.data || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        const intervalId = setInterval(fetchBookings, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const updateBookingStatus = async (id, newStatus) => {
        // Optimistic UI update
        const previousBookings = [...bookings];
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));

        try {
            await api.put(`/api/bookings/${id}/status`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Status update failed. Reverting...');
            setBookings(previousBookings); // Revert on failure
            fetchBookings(); // Fetch fresh data just in case
        }
    };

    // Derived Data
    const totalBookings = bookings.length;
    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            b.user?.name?.toLowerCase().includes(searchLower) ||
            b.user?.email?.toLowerCase().includes(searchLower) ||
            b.resource?.name?.toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
    });

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const formatDateTime = (start, end) => {
        if (!start) return { date: 'N/A', time: 'N/A' };
        
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : null;
        
        const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const startStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const endStr = endDate ? endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
        
        return {
            date: dateStr,
            time: endStr ? `${startStr} - ${endStr}` : startStr
        };
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDING': return { bg: '#fff7ed', color: '#ea580c', dot: '#ea580c' };
            case 'APPROVED': return { bg: '#ecfdf5', color: '#10b981', dot: '#10b981' };
            case 'REJECTED': return { bg: '#fef2f2', color: '#ef4444', dot: '#ef4444' };
            default: return { bg: '#f1f5f9', color: '#64748b', dot: '#64748b' };
        }
    };

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: '800', marginBottom: '8px', marginTop: 0 }}>Campus Bookings</h1>
            <p style={{ color: '#64748b', marginBottom: '32px', marginTop: 0 }}>Enterprise management interface for all resource reservations.</p>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {[
                    { title: 'TOTAL BOOKINGS', value: totalBookings, color: '#1e293b' },
                    { title: 'PENDING APPROVAL', value: pendingCount, color: '#ea580c' },
                    { title: 'OCCUPANCY RATE', value: '88%', color: '#1e293b' },
                    { title: 'SYSTEM UPTIME', value: '99.9%', color: '#1e293b' }
                ].map((kpi, idx) => (
                    <div key={idx} style={{ 
                        backgroundColor: 'white', 
                        padding: '24px', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>{kpi.title}</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: kpi.color, margin: 0 }}>{kpi.value}</h2>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
            }}>
                {/* Toolbar */}
                <div style={{ 
                    padding: '20px 24px', 
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    backgroundColor: '#fafafa'
                }}>
                    {/* Left Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white', fontSize: '0.9rem', color: '#1e293b' }}>
                            <option value="">Bulk Actions</option>
                            <option value="approve">Approve Selected</option>
                            <option value="reject">Reject Selected</option>
                        </select>
                        <button style={{ 
                            padding: '8px 16px', 
                            borderRadius: '6px', 
                            border: '1px solid #e2e8f0', 
                            backgroundColor: 'white', 
                            fontWeight: '600',
                            color: '#1e293b',
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>Apply</button>
                    </div>

                    {/* Right Filters */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                            type="text" 
                            placeholder="Search users or resources..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '6px', 
                                border: '1px solid #cbd5e1', 
                                width: '250px',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white', fontSize: '0.9rem', color: '#1e293b', fontWeight: '500' }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 24px', width: '40px' }}><input type="checkbox" /></th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading real-time data...</td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No bookings found.</td></tr>
                            ) : (
                                filteredBookings.map((booking) => {
                                    const { date, time } = formatDateTime(booking.startTime, booking.endTime);
                                    const statusStyle = getStatusStyles(booking.status);
                                    
                                    return (
                                        <tr key={booking.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '16px 24px' }}><input type="checkbox" /></td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                        {getInitials(booking.user?.name)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{booking.user?.name || 'Unknown User'}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{booking.user?.email || 'No email provided'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusStyle.dot }}></div>
                                                    <span style={{ fontWeight: '500', color: '#334155' }}>{booking.resource?.name || 'Unknown Resource'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>{date}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{time}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ 
                                                    backgroundColor: statusStyle.bg, 
                                                    color: statusStyle.color, 
                                                    padding: '4px 12px', 
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {booking.status === 'PENDING' && (
                                                        <>
                                                            <button 
                                                                onClick={() => updateBookingStatus(booking.id, 'APPROVED')}
                                                                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                                                            >Approve</button>
                                                            <button 
                                                                onClick={() => updateBookingStatus(booking.id, 'REJECTED')}
                                                                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}
                                                            >Reject</button>
                                                        </>
                                                    )}
                                                    {booking.status === 'REJECTED' && (
                                                        <button 
                                                            onClick={() => updateBookingStatus(booking.id, 'PENDING')}
                                                            style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                                                        >Review</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
