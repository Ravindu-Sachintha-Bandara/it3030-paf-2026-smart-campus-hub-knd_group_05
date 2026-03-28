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
        let bg, text, border;
        if (status === 'AVAILABLE') {
            bg = '#ecfdf5';
            text = '#059669';
            border = '#10b981';
        } else if (status === 'MAINTENANCE') {
            bg = '#fffbeb';
            text = '#d97706';
            border = '#f59e0b';
        } else {
            bg = '#f8fafc';
            text = '#64748b';
            border = '#e2e8f0';
        }

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                backgroundColor: bg,
                color: text,
                border: `1px solid ${border}`,
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
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
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <header style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Facilities & Assets</h1>
                    <p style={{ color: '#64748b', flex: 1, marginTop: '8px', fontSize: '1rem', fontWeight: '500' }}>Browse and manage premium campus resources.</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{ padding: '10px 20px', backgroundColor: showAddForm ? '#ffffff' : '#ea580c', color: showAddForm ? '#334155' : '#ffffff', borderRadius: '8px', border: showAddForm ? '1px solid #e2e8f0' : 'none', fontWeight: '600', cursor: 'pointer', boxShadow: showAddForm ? 'none' : '0 4px 6px -1px rgba(234, 88, 12, 0.2)', fontSize: '0.95rem' }}
                    >
                        {showAddForm ? 'Close Form' : '+ Add Resource'}
                    </button>
                )}
            </header>

            {error && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', marginBottom: '24px', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.95rem', fontWeight: '500' }}>{error}</div>}

            {isAdmin && showAddForm && (
                <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ marginTop: 0, fontSize: '1.25rem', color: '#0f172a', marginBottom: '24px', fontWeight: '700' }}>
                        {editingId ? 'Edit Resource' : 'Add New Resource'}
                    </h2>
                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '200px', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', fontWeight: '500', color: '#334155', backgroundColor: '#ffffff', outline: 'none' }}
                                placeholder="e.g. Conference Room A"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', fontWeight: '500', color: '#334155', backgroundColor: '#ffffff', outline: 'none' }}
                            >
                                <option value="ROOM">ROOM</option>
                                <option value="EQUIPMENT">EQUIPMENT</option>
                                <option value="OUTDOOR">OUTDOOR</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '200px', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                            <input
                                type="text"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', fontWeight: '500', color: '#334155', backgroundColor: '#ffffff', outline: 'none' }}
                                placeholder="e.g. Building 1, Floor 2"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '120px', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', fontWeight: '500', color: '#334155', backgroundColor: '#ffffff', outline: 'none' }}
                                placeholder="Qty"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#ea580c', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)', whiteSpace: 'nowrap' }}>
                                {editingId ? 'Save Changes' : 'Add Resource'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} style={{ padding: '12px 20px', backgroundColor: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search resources by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: '1', minWidth: '200px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#334155', fontWeight: '500', outline: 'none', backgroundColor: '#ffffff' }}
                />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#334155', fontWeight: '500', backgroundColor: '#ffffff', outline: 'none' }}>
                    <option value="All">TYPE: All</option>
                    <option value="ROOM">ROOM</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="OUTDOOR">OUTDOOR</option>
                    <option value="OTHER">OTHER</option>
                </select>
                <select value={filterCapacity} onChange={(e) => setFilterCapacity(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#334155', fontWeight: '500', backgroundColor: '#ffffff', outline: 'none' }}>
                    <option value="Any">CAPACITY: Any</option>
                    <option value="1-50">1 - 50</option>
                    <option value="51-200">51 - 200</option>
                    <option value="200+">200+</option>
                </select>
                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#334155', fontWeight: '500', backgroundColor: '#ffffff', outline: 'none' }}>
                    <option value="All">LOCATION: All</option>
                    {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#334155', fontWeight: '500', backgroundColor: '#ffffff', outline: 'none' }}>
                    <option value="Any">STATUS: Any</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                </select>
            </div>

            {loading ? (
                <p style={{ color: '#64748b', fontWeight: '500', fontSize: '0.95rem', textAlign: 'center', padding: '40px' }}>Loading resources...</p>
            ) : filteredResources.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {filteredResources.map(resource => (
                        <div key={resource.id} style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                                {getResourceIcon(resource.name, resource.type)}
                                <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#ea580c', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', zIndex: 2, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    {resource.type}
                                </span>
                            </div>
                            
                            <div style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <h3 style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '1.25rem', lineHeight: '1.3' }}>{resource.name}</h3>
                                    {renderStatusBadge(resource.status)}
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '0.95rem', fontWeight: '500' }}>
                                        <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                                            <svg width="18" height="18" fill="none" stroke="#64748b" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        Capacity: {resource.capacity}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '0.95rem', fontWeight: '500' }}>
                                        <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                                            <svg width="18" height="18" fill="none" stroke="#64748b" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        {resource.location}
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: 'auto', paddingTop: isAdmin ? '16px' : '0', borderTop: isAdmin ? '1px solid #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {isAdmin && <span style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>Details &rarr;</span>}
                                    
                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                            <button 
                                                title="Toggle Status"
                                                onClick={() => handleToggleStatus(resource)} 
                                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#64748b', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            </button>
                                            <button 
                                                title="Edit"
                                                onClick={() => handleEditClick(resource)} 
                                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#64748b', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button 
                                                title="Delete"
                                                onClick={() => handleDelete(resource.id)} 
                                                style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                <div style={{ textAlign: 'center', color: '#64748b', padding: '48px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>No resources match your search criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Resources;
