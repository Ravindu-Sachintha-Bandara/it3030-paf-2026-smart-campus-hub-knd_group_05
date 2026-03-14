import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleResolve = async (ticketId) => {
        const notes = window.prompt('Enter resolution notes:');
        if (!notes) {
            alert("Notes are required to resolve a ticket.");
            return;
        }
        try {
            await api.put(`/api/tickets/${ticketId}/resolve`,
                { resolutionNotes: notes },
                { headers: { 'Content-Type': 'application/json' } }
            );
            fetchTickets(); // Refresh data smoothly without page reload
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
                                <th style={{ padding: '15px', textAlign: 'left', width: '40%' }}>Description</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td style={{ padding: '15px', color: '#333' }}>#{ticket.id}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{ticket.title}</td>
                                    <td style={{ padding: '15px', color: '#666', fontSize: '0.95em' }}>
                                        {ticket.description.length > 60
                                            ? ticket.description.substring(0, 60) + '...'
                                            : ticket.description}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold',
                                            backgroundColor: ticket.status === 'RESOLVED' ? '#e2e3e5' : ticket.status === 'IN_PROGRESS' ? '#cce5ff' : '#f8d7da',
                                            color: ticket.status === 'RESOLVED' ? '#383d41' : ticket.status === 'IN_PROGRESS' ? '#004085' : '#721c24'
                                        }}>
                                            {ticket.status}
                                        </span>
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
        </div>
    );
};

export default AdminTickets;
