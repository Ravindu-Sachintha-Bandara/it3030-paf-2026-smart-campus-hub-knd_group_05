import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Monitor, Camera, Presentation, Dumbbell, DoorOpen, Box, Building } from 'lucide-react';

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
    const [filterCapacity, setFilterCapacity] = useState('Any');
    const [filterLocation, setFilterLocation] = useState('All');
    const [filterStatus, setFilterStatus] = useState('Any');

    const [showAddForm, setShowAddForm] = useState(false);

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
        setShowAddForm(true);
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

    const getResourceIcon = (name, type) => {
        const lowerName = name?.toLowerCase() || '';
        
        if (lowerName.includes('pc') || lowerName.includes('computer') || lowerName.includes('laptop')) {
            return <Monitor color="white" size={64} />;
        }
        if (lowerName.includes('camera')) {
            return <Camera color="white" size={64} />;
        }
        if (lowerName.includes('projector') || lowerName.includes('presentation')) {
            return <Presentation color="white" size={64} />;
        }
        if (lowerName.includes('tennis') || lowerName.includes('sport') || lowerName.includes('gym')) {
            return <Dumbbell color="white" size={64} />;
        }
        
        if (type === 'ROOM' || type === 'MEETING_ROOM') return <DoorOpen color="white" size={64} />;
        if (type === 'EQUIPMENT') return <Box color="white" size={64} />;
        return <Building color="white" size={64} />;
    };

    const uniqueLocations = React.useMemo(() => {
        const locs = resources.map(r => r.location).filter(Boolean);
        return [...new Set(locs)].sort();
    }, [resources]);

    const filteredResources = React.useMemo(() => {
        return resources.filter(resource => {
            const matchesSearch = resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resource.location?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'All' || resource.type === filterType;
            const matchesLocation = filterLocation === 'All' || resource.location?.toLowerCase().includes(filterLocation.toLowerCase());
            const matchesStatus = filterStatus === 'Any' || resource.status === filterStatus;
            
            let matchesCapacity = true;
            if (filterCapacity !== 'Any') {
                if (filterCapacity === '1-50') matchesCapacity = resource.capacity <= 50;
                else if (filterCapacity === '51-200') matchesCapacity = resource.capacity > 50 && resource.capacity <= 200;
                else if (filterCapacity === '200+') matchesCapacity = resource.capacity > 200;
            }

            return matchesSearch && matchesType && matchesLocation && matchesStatus && matchesCapacity;
        });
    }, [resources, searchQuery, filterType, filterLocation, filterStatus, filterCapacity]);

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--sliit-dark-navy)' }}>Facilities & Assets</h1>
                    <p style={{ color: 'var(--sliit-gray)', flex: 1, marginTop: '5px' }}>Browse and manage premium campus resources.</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{ padding: '10px 20px', backgroundColor: 'var(--sliit-orange)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)' }}
                    >
                        {showAddForm ? 'Close Form' : '+ Add Resource'}
                    </button>
                )}
            </header>

            {error && <div style={{ padding: '15px', backgroundColor: '#fce8e6', color: '#d93025', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

            {isAdmin && showAddForm && (
                <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #f3f4f6' }}>
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
                            <button type="submit" className="btn-primary" style={{ padding: '11px 20px', height: '42px', whiteSpace: 'nowrap', borderRadius: '6px' }}>
                                {editingId ? 'Save Changes' : 'Add Resource'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} style={{ padding: '11px 20px', height: '42px', whiteSpace: 'nowrap', backgroundColor: 'transparent', color: 'var(--sliit-gray)', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search resources by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: '1', minWidth: '200px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', color: '#4b5563' }}
                />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', color: '#4b5563', backgroundColor: 'white' }}>
                    <option value="All">TYPE: All</option>
                    <option value="ROOM">ROOM</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="OUTDOOR">OUTDOOR</option>
                    <option value="OTHER">OTHER</option>
                </select>
                <select value={filterCapacity} onChange={(e) => setFilterCapacity(e.target.value)} style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', color: '#4b5563', backgroundColor: 'white' }}>
                    <option value="Any">CAPACITY: Any</option>
                    <option value="1-50">1 - 50</option>
                    <option value="51-200">51 - 200</option>
                    <option value="200+">200+</option>
                </select>
                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', color: '#4b5563', backgroundColor: 'white' }}>
                    <option value="All">LOCATION: All</option>
                    {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', color: '#4b5563', backgroundColor: 'white' }}>
                    <option value="Any">STATUS: Any</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                </select>
            </div>

            {loading ? (
                <p style={{ color: 'var(--sliit-gray)' }}>Loading resources...</p>
            ) : filteredResources.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {filteredResources.map(resource => (
                        <div key={resource.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sidebar-bg)' }}>
                                {getResourceIcon(resource.name, resource.type)}
                                <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--sliit-orange)', color: 'white', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 2 }}>
                                    {resource.type}
                                </span>
                            </div>
                            
                            <div style={{ padding: '20px', flex: '1', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontWeight: 600, color: 'var(--sliit-navy)', fontSize: '1.2rem', lineHeight: '1.3' }}>{resource.name}</h3>
                                    {renderStatusBadge(resource.status)}
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.9rem' }}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        Capacity: {resource.capacity}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.9rem' }}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {resource.location}
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: 'auto', paddingTop: isAdmin ? '16px' : '0', borderTop: isAdmin ? '1px solid #f3f4f6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {isAdmin && <span style={{ color: 'var(--sliit-navy)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Details &rarr;</span>}
                                    
                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                            <button 
                                                title="Toggle Status"
                                                onClick={() => handleToggleStatus(resource)} 
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            </button>
                                            <button 
                                                title="Edit"
                                                onClick={() => handleEditClick(resource)} 
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button 
                                                title="Delete"
                                                onClick={() => handleDelete(resource.id)} 
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: 'var(--sliit-gray)', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>No resources match your search criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Resources;
