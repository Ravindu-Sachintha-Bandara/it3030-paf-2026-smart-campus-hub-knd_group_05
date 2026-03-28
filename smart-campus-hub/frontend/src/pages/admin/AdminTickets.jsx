import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // LIVE DATA ENGINE
    const fetchTickets = async () => {
        try {
            const response = await api.get('/api/tickets');
            const fetchedTickets = response.data || [];
            // Sort newest first
            fetchedTickets.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            setTickets(fetchedTickets);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 10000); // Polls every 10 seconds!
        return () => clearInterval(interval);
    }, []);

    // LIVE KPI MATH
    const totalOpen = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
    const highPriority = tickets.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT' || t.priority === 'CRITICAL').length;
    const unassignedCount = tickets.filter(t => !t.assignedTech || t.assignedTech === 'Unassigned').length;

    // Helper functions
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#ea580c', letterSpacing: '0.05em', textTransform: 'uppercase' }}>MAINTENANCE &amp; INCIDENT LOG</p>
                    <h1 style={{ margin: '4px 0 0 0', fontSize: '2rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>Ticket Management</h1>
                </div>
                <button style={{ backgroundColor: '#ea580c', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                    + New Ticket
                </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TOTAL OPEN</p>
                    <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>{totalOpen}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>HIGH PRIORITY</p>
                    <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#ea580c', fontWeight: '800', letterSpacing: '-0.025em' }}>{highPriority}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>UNASSIGNED</p>
                    <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>{unassignedCount}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>AVG. RESOLUTION</p>
                    <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>4.2 hrs</h2>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px 12px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none' }}>
                <input type="text" placeholder="Search by ID, reporter or category..." style={{ padding: '10px 16px', width: '300px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#334155', fontSize: '0.95rem', fontWeight: '500' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>Filter</button>
                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>Export</button>
                </div>
            </div>

            {/* Master Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TICKET ID</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>REPORTER</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CATEGORY</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRIORITY</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ASSIGNED TECH</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Loading live tickets...</td></tr>
                        ) : tickets.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>No tickets found in the database.</td></tr>
                        ) : (
                            tickets.map(ticket => {
                                let statusStyles = { color: '#334155', backgroundColor: 'transparent' };
                                if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
                                    statusStyles = { color: '#059669', backgroundColor: '#ecfdf5' };
                                } else if (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || ticket.status === 'PENDING') {
                                    statusStyles = { color: '#d97706', backgroundColor: '#fffbeb' };
                                } else if (ticket.status === 'CRITICAL' || ticket.status === 'URGENT') {
                                    statusStyles = { color: '#dc2626', backgroundColor: '#fef2f2' };
                                }
                                
                                return (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>#{ticket.id}</td>
                                    
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.95rem', color: '#334155', border: '1px solid #e2e8f0' }}>
                                                {getInitials(ticket.user?.name)}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>{ticket.user?.name || 'Unknown User'}</p>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>{ticket.user?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td style={{ padding: '16px 24px', color: '#334155', fontSize: '0.95rem', fontWeight: '500' }}>{ticket.category || 'OTHER'}</td>
                                    
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' || ticket.priority === 'URGENT' ? '#ea580c' : '#64748b' }}></div>
                                            {ticket.priority || 'LOW'}
                                        </span>
                                    </td>
                                    
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase',
                                            ...statusStyles 
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    
                                    <td style={{ padding: '16px 24px', color: '#334155', fontSize: '0.95rem', fontWeight: '500' }}>{ticket.assignedTech || 'Unassigned'}</td>
                                    
                                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '1rem', display: 'flex', gap: '12px' }}>
                                        <span style={{ cursor: 'pointer' }} title="Assign Tech">👤+</span>
                                        <span style={{ cursor: 'pointer' }} title="Edit Ticket">✏️</span>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
                <div style={{ padding: '16px 24px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
                    <span>Showing 1 to {tickets.length} of {tickets.length} tickets</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', color: '#334155', padding: '4px 12px', borderRadius: '4px', fontWeight: '500' }}>&lt;</button>
                        <button style={{ border: 'none', background: '#0f172a', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontWeight: '600' }}>1</button>
                        <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', color: '#334155', padding: '4px 12px', borderRadius: '4px', fontWeight: '500' }}>&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTickets;