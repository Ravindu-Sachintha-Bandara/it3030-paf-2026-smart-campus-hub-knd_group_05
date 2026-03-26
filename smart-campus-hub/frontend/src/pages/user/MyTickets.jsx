import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORTED NAVIGATE
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MyTickets = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); // 2. INITIALIZED NAVIGATE
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
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#b45309', letterSpacing: '1px', textTransform: 'uppercase' }}>User Support Center</p>
                    <h1 style={{ margin: '4px 0 0 0', fontSize: '2.2rem', color: '#1e293b', fontWeight: '900', letterSpacing: '-0.5px' }}>My Support Tickets</h1>
                </div>
                
                {/* 3. WIRED UP THE BUTTON AND CHANGED THE TEXT! */}
                <button 
                    onClick={() => navigate('/tickets/new')}
                    style={{ 
                        backgroundColor: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '8px', 
                        border: 'none', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.2)'
                    }}
                >
                    New Ticket Request
                </button>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>TOTAL TICKETS</p>
                    <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#1e293b', fontWeight: '900' }}>{tickets.length}</h2>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>OPEN TICKETS</p>
                        {openTickets.length > 0 && <span style={{ backgroundColor: '#fff7ed', color: '#ea580c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>Action Needed</span>}
                    </div>
                    <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#1e293b', fontWeight: '900' }}>{openTickets.length}</h2>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>RESOLVED</p>
                    <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#1e293b', fontWeight: '900' }}>{resolvedTickets.length}</h2>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>NEW NOTIFICATIONS</p>
                        <span style={{ backgroundColor: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>New</span>
                    </div>
                    <h2 style={{ margin: '12px 0 0 0', fontSize: '2.5rem', color: '#1e293b', fontWeight: '900' }}>02</h2>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                
                {/* Left Column: Active Queue */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '20px', backgroundColor: '#b45309', borderRadius: '2px' }}></div>
                            Active Incident Queue
                        </h3>
                        <span style={{ color: '#b45309', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>VIEW ALL TICKETS</span>
                    </div>

                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '12px' }}>You have no support tickets.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Featured Dark Card (Most Recent Open Ticket) */}
                            {featuredTicket && (
                                <div style={{ backgroundColor: '#0a192f', padding: '32px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                        <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            {featuredTicket.priority || 'PRIORITY'}
                                        </span>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ticket #{featuredTicket.id?.toString().padStart(5, '0')}</span>
                                    </div>
                                    
                                    <h2 style={{ margin: '0 0 16px 0', fontSize: '2rem', fontWeight: '800', lineHeight: '1.2' }}>{featuredTicket.title || 'Support Request'}</h2>
                                    <p style={{ margin: '0 0 32px 0', color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.6', maxWidth: '80%' }}>
                                        {featuredTicket.description || 'No detailed description provided.'}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Status</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>{featuredTicket.status}</p>
                                        </div>
                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Submitted</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>{formatDate(featuredTicket.createdAt)}</p>
                                        </div>
                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Assigned To</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>Campus Support</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <button style={{ backgroundColor: '#b45309', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>👁 View Details</button>
                                        <button style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Add Comment</button>
                                    </div>
                                </div>
                            )}

                            {/* Standard Open Tickets List */}
                            {standardTickets.map(ticket => (
                                <div key={ticket.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            🎫
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 'bold' }}>{ticket.title}</h4>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Ticket #{ticket.id} • {formatDate(ticket.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: ticket.status === 'PENDING' ? '#b45309' : '#3b82f6', textTransform: 'uppercase' }}>
                                            {ticket.status}
                                        </span>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>UPDATED RECENTLY</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Timeline */}
                <div>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #f1f5f9', minHeight: '500px' }}>
                        <h3 style={{ margin: '0 0 32px 0', fontSize: '1rem', color: '#1e293b', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>Activity Timeline</h3>
                        
                        <div style={{ position: 'relative', paddingLeft: '24px' }}>
                            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '0', width: '2px', backgroundColor: '#e2e8f0' }}></div>

                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #1e293b' }}></div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}><span style={{ fontWeight: 'bold' }}>System</span> checked your recent ticket request.</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>JUST NOW</p>
                            </div>

                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #b45309' }}></div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}><span style={{ fontWeight: 'bold' }}>Support Desk</span> updated status to Reviewing.</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>14 MINUTES AGO</p>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #cbd5e1' }}></div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>Ticket successfully created and routed.</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>42 MINUTES AGO</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Floating Action Button */}
            <button 
                onClick={() => navigate('/tickets/new')}
                style={{ 
                    position: 'fixed', bottom: '40px', right: '40px', width: '60px', height: '60px', 
                    borderRadius: '50%', backgroundColor: '#b45309', color: 'white', fontSize: '2rem', 
                    border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(180, 83, 9, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s'
                }} 
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                +
            </button>
        </div>
    );
};

export default MyTickets;