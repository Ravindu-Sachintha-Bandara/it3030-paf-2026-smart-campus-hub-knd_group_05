import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resolveModal, setResolveModal] = useState({ isOpen: false, ticketId: null, note: '' });

    const fetchTickets = async () => {
        try {
            const response = await api.get('/api/tickets');
            setTickets(response.data);
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError('Failed to load tickets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleResolve = (ticketId) => {
        setResolveModal({ isOpen: true, ticketId: ticketId, note: '' });
    };

    const handleConfirmResolve = async () => {
        const { ticketId, note } = resolveModal;
        if (note.trim() === '') {
            alert("Notes are required to resolve a ticket.");
            return;
        }
        try {
            await api.put(`/api/tickets/${ticketId}/resolve`,
                { status: 'RESOLVED', resolutionNotes: note },
                { headers: { 'Content-Type': 'application/json' } }
            );
            setResolveModal({ isOpen: false, ticketId: null, note: '' });
            fetchTickets(); 
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed to resolve ticket. Check console.'));
            console.error("Resolve error details:", error.response || error);
        }
    };

    return (
        <div>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>
                    All Support Tickets (Admin)
                </h1>
            </header>

            {error && <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {loading ? (
                <p>Loading tickets...</p>
            ) : tickets.length > 0 ? (
                <div className="card-container" style={{ overflow: 'x-auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', textTransform: 'uppercase', fontSize: '13px', color: '#555', borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Title</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Category</th>
                                <th style={{ padding: '15px', textAlign: 'left', width: '30%' }}>Description</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Resource ID</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Resolution</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td style={{ padding: '15px', color: '#333' }}>#{ticket.id}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{ticket.title}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#0056b3' }}>{ticket.category || 'N/A'}</td>
                                    <td style={{ padding: '15px', color: '#666', fontSize: '0.95em' }}>
                                        {ticket.description.length > 60
                                            ? ticket.description.substring(0, 60) + '...'
                                            : ticket.description}
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{ticket.resourceId ? `Resource ${ticket.resourceId}` : '-'}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold',
                                            backgroundColor: ticket.status === 'RESOLVED' ? '#e2e3e5' : ticket.status === 'IN_PROGRESS' ? '#cce5ff' : '#f8d7da',
                                            color: ticket.status === 'RESOLVED' ? '#383d41' : ticket.status === 'IN_PROGRESS' ? '#004085' : '#721c24'
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        {ticket.resolutionNotes ? (
                                            <span style={{ color: '#64748B', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                {ticket.resolutionNotes}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        {ticket.status !== 'RESOLVED' && (
                                            <button
                                                onClick={() => handleResolve(ticket.id)}
                                                className="btn-primary"
                                                style={{ padding: '6px 12px', fontSize: '0.85em' }}>
                                                Resolve
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
                    <p>No tickets found.</p>
                </div>
            )}

            {resolveModal.isOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: 'var(--sliit-navy)', marginTop: 0 }}>Resolve Ticket</h3>
                        <textarea
                            value={resolveModal.note}
                            onChange={(e) => setResolveModal({ ...resolveModal, note: e.target.value })}
                            placeholder="Enter resolution notes (how was this fixed?)..."
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px', marginBottom: '15px', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setResolveModal({ isOpen: false, ticketId: null, note: '' })}
                                style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmResolve}
                                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Confirm Resolution
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTickets;
