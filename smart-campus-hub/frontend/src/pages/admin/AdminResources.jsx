import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [type, setType] = useState('ROOM');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState('');

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/resources');
            setResources(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching resources:', err);
            setError('Failed to load resources. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/resources', {
                name,
                type,
                location,
                capacity: parseInt(capacity, 10),
                status: 'AVAILABLE' // Default status for new resources
            });
            setName('');
            setType('ROOM');
            setLocation('');
            setCapacity('');
            fetchResources();
        } catch (err) {
            console.error('Error adding resource:', err);
            alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
        }
    };

    const handleToggleStatus = async (resource) => {
        const newStatus = resource.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
        try {
            // Note: Depending on backend, this might be a full PUT with all fields, or a dedicated status endpoint like /api/resources/{id}/status 
            // The prompt says: "Clicking it sends a PUT /api/resources/{id}/status request to flip it between AVAILABLE and MAINTENANCE."
            await api.put(`/api/resources/${resource.id}/status`, { status: newStatus });
            fetchResources();
        } catch (err) {
            console.error('Error toggling status:', err);
            // Fallback if /status endpoint doesn't exist but full PUT does (common REST pattern)
            if (err.response && err.response.status === 404) {
                try {
                    await api.put(`/api/resources/${resource.id}`, { ...resource, status: newStatus });
                    fetchResources();
                } catch (putErr) {
                    alert('Error toggling status: ' + (putErr.response?.data?.message || putErr.response?.data?.error || putErr.message));
                }
            } else {
                alert('Error toggling status: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await api.delete(`/api/resources/${id}`);
                fetchResources();
            } catch (err) {
                console.error('Error deleting resource:', err);
                alert('Error deleting resource: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
            }
        }
    };

    const renderStatusBadge = (status) => {
        let bg, text;
        if (status === 'AVAILABLE') {
            bg = '#e6f4ea';
            text = '#1e8e3e';
        } else if (status === 'MAINTENANCE') {
            bg = '#fce8e6';
            text = '#d93025';
        } else {
            bg = '#f1f3f4';
            text = '#5f6368';
        }

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: bg,
                color: text,
                display: 'inline-block'
            }}>
                {status || 'UNKNOWN'}
            </span>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: 'var(--sliit-dark-navy)' }}>Facilities & Assets Catalogue</h1>
            </header>

            {error && <div style={{ padding: '15px', backgroundColor: '#fce8e6', color: '#d93025', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {/* Add New Resource Form */}
            <div style={{
                background: 'var(--white)',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                marginBottom: '30px'
            }}>
                <h2 style={{ marginTop: 0, fontSize: '1.2em', color: 'var(--sliit-dark-navy)', marginBottom: '20px' }}>Add New Resource</h2>
                <form onSubmit={handleAddResource} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '200px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--sliit-gray)', fontWeight: '500' }}>Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                            placeholder="e.g. Conference Room A"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--sliit-gray)', fontWeight: '500' }}>Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white' }}
                        >
                            <option value="ROOM">ROOM</option>
                            <option value="EQUIPMENT">EQUIPMENT</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '200px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--sliit-gray)', fontWeight: '500' }}>Location</label>
                        <input
                            type="text"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                            placeholder="e.g. Building 1, Floor 2"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '120px' }}>
                        <label style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--sliit-gray)', fontWeight: '500' }}>Capacity</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                            placeholder="Qty"
                        />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <button type="submit" className="btn-primary" style={{ padding: '11px 20px', height: '42px', whiteSpace: 'nowrap' }}>
                            Add Resource
                        </button>
                    </div>
                </form>
            </div>

            {/* Master Inventory Table */}
            <div style={{
                background: 'var(--white)',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{ marginTop: 0, fontSize: '1.2em', color: 'var(--sliit-dark-navy)', marginBottom: '20px' }}>Master Inventory</h2>

                {loading ? (
                    <p style={{ color: 'var(--sliit-gray)' }}>Loading resources...</p>
                ) : resources.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>ID</th>
                                    <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Name</th>
                                    <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Type</th>
                                    <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Location</th>
                                    <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Capacity</th>
                                    <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', paddingRight: '15px' }}>Status</th>
                                    <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map(resource => (
                                    <tr key={resource.id} style={{ borderBottom: '1px solid var(--sliit-light-bg)' }}>
                                        <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-dark-navy)', fontWeight: '500' }}>#{resource.id}</td>
                                        <td style={{ padding: '16px 15px 16px 0', fontWeight: '500' }}>{resource.name}</td>
                                        <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-gray)' }}>{resource.type}</td>
                                        <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-gray)' }}>{resource.location}</td>
                                        <td style={{ padding: '16px 15px 16px 0' }}>{resource.capacity}</td>
                                        <td style={{ padding: '16px 15px 16px 0' }}>{renderStatusBadge(resource.status)}</td>
                                        <td style={{ padding: '16px 0', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleToggleStatus(resource)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        color: 'var(--sliit-gray)',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Toggle Status
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resource.id)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        color: '#d93025',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid #d93025',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--sliit-gray)', padding: '20px' }}>
                        <p>No resources found in the catalogue.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminResources;
