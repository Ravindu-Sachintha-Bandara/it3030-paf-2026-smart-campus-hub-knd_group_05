import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Tickets = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [resourceId, setResourceId] = useState('');
    const [file, setFile] = useState(null);
    const [resources, setResources] = useState([]);

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

    const fetchTickets = async () => {
        if (!user) return;
        try {
            const endpoint = user.role === 'ADMIN' ? '/api/tickets' : `/api/tickets?userId=${user.id}`;
            const response = await api.get(endpoint);
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
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            const ticketBlob = new Blob([JSON.stringify({
                title,
                description,
                resourceId: parseInt(resourceId, 10)
            })], { type: 'application/json' });

            formData.append('ticket', ticketBlob);
            if (file) {
                formData.append('file', file);
            }

            await api.post('/api/tickets', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Clear form
            setTitle('');
            setDescription('');
            setResourceId('');
            setFile(null);
            // Refresh table
            fetchTickets();
        } catch (err) {
            console.error('Error creating ticket:', err);
            alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
        }
    };

    const handleCancel = async (ticketId) => {
        if (window.confirm('Are you sure you want to cancel this ticket?')) {
            try {
                await api.delete(`/api/tickets/${ticketId}`);
                fetchTickets();
            } catch (err) {
                console.error('Error canceling ticket:', err);
                alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
            }
        }
    };

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
            window.location.reload(); // Force page refresh on success
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed to resolve ticket. Check console.'));
            console.error("Resolve error details:", error.response || error);
        }
    };

    return (
        <div>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>
                    {user?.role === 'ADMIN' ? 'All Support Tickets' : 'Support Tickets'}
                </h1>
            </header>

            {user?.role !== 'ADMIN' && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #e9ecef' }}>
                    <h2 style={{ top: 0, marginTop: 0, fontSize: '1.2em', color: '#444', marginBottom: '16px' }}>Submit a Ticket</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                placeholder="Brief issue title"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '2', minWidth: '300px' }}>
                            <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Description</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical', minHeight: '38px' }}
                                placeholder="Detailed description"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px' }}>
                            <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Resource</label>
                            <select
                                required
                                value={resourceId}
                                onChange={(e) => setResourceId(e.target.value)}
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
                            >
                                <option value="">Select Resource</option>
                                {resources.map(res => (
                                    <option key={res.id} value={res.id}>{res.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '14px', marginBottom: '5px', color: '#555' }}>Attachment (Optional)</label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '62px' }}>
                            <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--sliit-orange)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {error && <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {loading ? (
                <p>Loading tickets...</p>
            ) : tickets.length > 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', textTransform: 'uppercase', fontSize: '13px', color: '#555', borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                                {user?.role === 'ADMIN' && <th style={{ padding: '15px', textAlign: 'left' }}>Submitted By</th>}
                                <th style={{ padding: '15px', textAlign: 'left' }}>Title</th>
                                <th style={{ padding: '15px', textAlign: 'left', width: '30%' }}>Description</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Resource ID</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid #e9ecef', ':hover': { backgroundColor: '#f8f9fa' } }}>
                                    <td style={{ padding: '15px', color: '#333' }}>#{ticket.id}</td>
                                    {user?.role === 'ADMIN' && <td style={{ padding: '15px', color: '#666' }}>User {ticket.userId}</td>}
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{ticket.title}</td>
                                    <td style={{ padding: '15px', color: '#666', fontSize: '0.95em' }}>
                                        {ticket.description.length > 60
                                            ? ticket.description.substring(0, 60) + '...'
                                            : ticket.description}
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>Resource {ticket.resourceId}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold',
                                            backgroundColor: ticket.status === 'RESOLVED' ? '#d4edda' : ticket.status === 'IN_PROGRESS' ? '#cce5ff' : '#fff3cd',
                                            color: ticket.status === 'RESOLVED' ? '#155724' : ticket.status === 'IN_PROGRESS' ? '#004085' : '#856404'
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        {user?.role === 'ADMIN' ? (
                                            ticket.status !== 'RESOLVED' && (
                                                <button
                                                    onClick={() => handleResolve(ticket.id)}
                                                    style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#28a745', border: '1px solid #28a745', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#28a745'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#28a745'; }}
                                                >
                                                    Mark Resolved
                                                </button>
                                            )
                                        ) : (
                                            (ticket.status === 'OPEN' || ticket.status === 'PENDING') && (
                                                <button
                                                    onClick={() => handleCancel(ticket.id)}
                                                    style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                                                    Cancel
                                                </button>
                                            )
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

export default Tickets;
