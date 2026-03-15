import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Resources = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [type, setType] = useState('ROOM');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/resources');
            setResources(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching resources:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Session expired or unauthorized. Please log in again.');
            } else {
                setError('Failed to load resources. ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const resetForm = () => {
        setName('');
        setType('ROOM');
        setLocation('');
        setCapacity('');
        setEditingId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                type,
                location,
                capacity: parseInt(capacity, 10),
            };

            if (editingId) {
                // Update
                await api.put(`/api/resources/${editingId}`, payload);
            } else {
                // Create
                payload.status = 'AVAILABLE';
                await api.post('/api/resources', payload);
            }

            resetForm();
            fetchResources();
        } catch (err) {
            console.error(editingId ? 'Error updating resource:' : 'Error adding resource:', err);
            alert('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
        }
    };

    const handleEditClick = (resource) => {
        setName(resource.name);
        setType(resource.type);
        setLocation(resource.location);
        setCapacity(resource.capacity.toString());
        setEditingId(resource.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleStatus = async (resource) => {
        if (!isAdmin) return;
        const newStatus = resource.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
        try {
            await api.put(`/api/resources/${resource.id}/status`, { status: newStatus });
            fetchResources();
        } catch (err) {
            console.error('Error toggling status:', err);
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
        if (!isAdmin) return;
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

    const filteredResources = React.useMemo(() => {
        return resources.filter(resource => {
            const matchesSearch = resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resource.location?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'All' || resource.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [resources, searchQuery, filterType]);

    return (
        <div style={{ padding: '24px' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: 'var(--sliit-dark-navy)' }}>Facilities & Assets Catalogue</h1>
                <p style={{ color: 'var(--sliit-gray)', marginTop: '5px' }}>Browse available campus facilities and equipment.</p>
            </header>

            {error && <div style={{ padding: '15px', backgroundColor: '#fce8e6', color: '#d93025', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {isAdmin && (
                <div style={{
                    background: 'var(--white)',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    marginBottom: '30px'
                }}>
                    <h2 style={{ marginTop: 0, fontSize: '1.2em', color: 'var(--sliit-dark-navy)', marginBottom: '20px' }}>
                        {editingId ? 'Edit Resource' : 'Add New Resource'}
                    </h2>
                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
                                <option value="OUTDOOR">OUTDOOR</option>
                                <option value="OTHER">OTHER</option>
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
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ padding: '11px 20px', height: '42px', whiteSpace: 'nowrap' }}>
                                {editingId ? 'Save Changes' : 'Add Resource'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} style={{
                                    padding: '11px 20px',
                                    height: '42px',
                                    whiteSpace: 'nowrap',
                                    backgroundColor: 'transparent',
                                    color: 'var(--sliit-gray)',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search resources by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        flex: '1',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        minWidth: '150px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                >
                    <option value="All">All Types</option>
                    <option value="ROOM">ROOM</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="OUTDOOR">OUTDOOR</option>
                    <option value="OTHER">OTHER</option>
                </select>
            </div>

            <div style={{
                background: 'var(--white)',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2em', color: 'var(--sliit-dark-navy)' }}>Master Inventory</h2>
                    <span style={{ fontSize: '0.9rem', color: 'var(--sliit-gray)' }}>Showing {filteredResources.length} items</span>
                </div>

                {loading ? (
                    <p style={{ color: 'var(--sliit-gray)' }}>Loading resources...</p>
                ) : filteredResources.length > 0 ? (
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
                                    {isAdmin && (
                                        <th style={{ color: 'var(--sliit-gray)', borderBottom: '2px solid var(--sliit-light-bg)', paddingBottom: '12px', textAlign: 'center' }}>Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResources.map(resource => (
                                    <tr key={resource.id} style={{ borderBottom: '1px solid var(--sliit-light-bg)' }}>
                                        <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-dark-navy)', fontWeight: '500' }}>#{resource.id}</td>
                                        <td style={{ padding: '16px 15px 16px 0', fontWeight: '500' }}>{resource.name}</td>
                                        <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-gray)' }}>{resource.type}</td>
                                        <td style={{ padding: '16px 15px 16px 0', color: 'var(--sliit-gray)' }}>{resource.location}</td>
                                        <td style={{ padding: '16px 15px 16px 0' }}>{resource.capacity}</td>
                                        <td style={{ padding: '16px 15px 16px 0' }}>{renderStatusBadge(resource.status)}</td>
                                        {isAdmin && (
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
                                                        onClick={() => handleEditClick(resource)}
                                                        style={{
                                                            padding: '6px 16px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            color: 'var(--sliit-navy)',
                                                            backgroundColor: 'transparent',
                                                            border: '1px solid var(--sliit-navy)',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Edit
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
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--sliit-gray)', padding: '20px' }}>
                        <p>No resources match your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Resources;
