import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MyTickets = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyTickets = async () => {
        try {
            const response = await api.get('/api/tickets');
            const myTickets = (response.data || []).filter(t => t.userId === user?.id || t.user?.id === user?.id);
            myTickets.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            setTickets(myTickets);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching my tickets:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTickets();
        const interval = setInterval(fetchMyTickets, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const openTickets = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED');
    const resolvedTickets = tickets.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED');
    const featuredTicket = openTickets.length > 0 ? openTickets[0] : null;
    const standardTickets = openTickets.slice(1);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Just Now';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', position: 'relative', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>User Support Center</p>
                    <h1 style={{ margin: '8px 0 0 0', fontSize: '2rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>My Support Tickets</h1>
                </div>
                
                <button 
                    onClick={() => navigate('/tickets/new')}
                    style={{ 
                        backgroundColor: '#ea580c', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', 
                        border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#c2410c'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#ea580c'}
                >
                    + New Ticket
                </button>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TOTAL TICKETS</p>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>{tickets.length}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>OPEN TICKETS</p>
                        {openTickets.length > 0 && <span style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #f59e0b', letterSpacing: '0.05em' }}>ACTION NEEDED</span>}
                    </div>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>{openTickets.length}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>RESOLVED</p>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>{resolvedTickets.length}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>NEW NOTIFICATIONS</p>
                        <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #bfdbfe', letterSpacing: '0.05em' }}>NEW</span>
                    </div>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>02</h2>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                
                {/* Left Column: Active Queue */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '4px', height: '20px', backgroundColor: '#ea580c', borderRadius: '2px' }}></div>
                            Active Incident Queue
                        </h3>
                        <span onClick={() => navigate('/tickets')} style={{ color: '#ea580c', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VIEW ALL TICKETS</span>
                    </div>

                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', fontWeight: '500' }}>You have no support tickets.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Featured Dark Card (Most Recent Open Ticket) */}
                            {featuredTicket && (
                                <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '12px', color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                        <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #ef4444', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' }}>
                                            {featuredTicket.priority || 'PRIORITY'}
                                        </span>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>Ticket #{featuredTicket.id?.toString().padStart(5, '0')}</span>
                                    </div>
                                    
                                    <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.2' }}>{featuredTicket.title || 'Support Request'}</h2>
                                    <p style={{ margin: '0 0 32px 0', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '80%' }}>
                                        {featuredTicket.description || 'No detailed description provided.'}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                        <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(248, 250, 252, 0.1)' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</p>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', fontWeight: '600' }}>{featuredTicket.status}</p>
                                        </div>
                                        <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(248, 250, 252, 0.1)' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</p>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', fontWeight: '600' }}>{formatDate(featuredTicket.createdAt)}</p>
                                        </div>
                                        <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(248, 250, 252, 0.1)' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned To</p>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', fontWeight: '600' }}>Campus Support</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <button style={{ backgroundColor: '#ea580c', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>View Details</button>
                                        <button style={{ backgroundColor: 'transparent', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(248, 250, 252, 0.2)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>Add Comment</button>
                                    </div>
                                </div>
                            )}

                            {/* Standard Open Tickets List */}
                            {standardTickets.map(ticket => (
                                <div key={ticket.id} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1px solid #e2e8f0' }}>
                                            🎫
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>{ticket.title}</h4>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Ticket #{ticket.id} • {formatDate(ticket.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: ticket.status === 'PENDING' ? '#d97706' : '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {ticket.status}
                                        </span>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>UPDATED RECENTLY</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Timeline */}
                <div>
                    <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '500px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                        <h3 style={{ margin: '0 0 32px 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>Activity Timeline</h3>
                        
                        <div style={{ position: 'relative', paddingLeft: '24px' }}>
                            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '0', width: '2px', backgroundColor: '#e2e8f0' }}></div>

                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffffff', border: '2px solid #0f172a' }}></div>
                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontWeight: '500' }}><span style={{ fontWeight: '600', color: '#0f172a' }}>System</span> checked your recent ticket request.</p>
                                <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>JUST NOW</p>
                            </div>

                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffffff', border: '2px solid #ea580c' }}></div>
                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontWeight: '500' }}><span style={{ fontWeight: '600', color: '#0f172a' }}>Support Desk</span> updated status to Reviewing.</p>
                                <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>14 MINUTES AGO</p>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffffff', border: '2px solid #cbd5e1' }}></div>
                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontWeight: '500' }}>Ticket successfully created and routed.</p>
                                <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>42 MINUTES AGO</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            

        </div>
    );
};

export default MyTickets;