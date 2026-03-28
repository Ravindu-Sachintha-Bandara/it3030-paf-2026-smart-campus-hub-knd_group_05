import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NewBookingRequest = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: ''
    });

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await api.get('/api/resources');
                setResources(response.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch resources:", error);
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.resourceId || !formData.date || !formData.startTime || !formData.endTime) {
            alert('Please fill in all required fields.');
            return;
        }

        setSubmitting(true);
        try {
            const startDateTime = `${formData.date}T${formData.startTime}:00`;
            const endDateTime = `${formData.date}T${formData.endTime}:00`;

            const payload = {
                resource: { id: parseInt(formData.resourceId) },
                user: { id: user.id },
                startTime: startDateTime,
                endTime: endDateTime,
                purpose: formData.purpose,
                status: 'PENDING'
            };

            await api.post('/api/bookings', payload);
            navigate('/bookings');
        } catch (error) {
            console.error('Failed to submit booking:', error);
            alert('Error submitting request. Please try again.');
            setSubmitting(false);
        }
    };

    // Derived resource
    const selectedResource = formData.resourceId 
        ? resources.find(r => r.id === parseInt(formData.resourceId)) 
        : null;

    // Helper functions for dynamic UI
    const getResourceIcon = (type) => {
        switch (type) {
            case 'MEETING_ROOM':
            case 'ROOM':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
            case 'EQUIPMENT':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />;
            case 'OUTDOOR':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />;
            default:
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />;
        }
    };

    const statusStyles = selectedResource?.status === 'AVAILABLE' 
        ? { bg: '#ecfdf5', color: '#059669', border: '#10b981' } 
        : { bg: '#fef2f2', color: '#dc2626', border: '#ef4444' };

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>Resource Reservation</h1>
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Submit your request for academic or event space utilization.</p>
            </div>

            {/* Main Layout 2-Column */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', alignItems: 'start' }}>
                
                {/* Left Column: Form */}
                <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '4px', height: '20px', backgroundColor: '#ea580c', borderRadius: '2px' }}></div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>Request Details</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource</label>
                            <select 
                                name="resourceId" 
                                value={formData.resourceId} 
                                onChange={handleChange}
                                required
                                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontWeight: '500', backgroundColor: '#ffffff', color: '#334155' }}
                            >
                                <option value="" disabled>Select a resource...</option>
                                {loading ? (
                                    <option disabled>Loading resources...</option>
                                ) : (
                                    resources.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} - {r.type}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
                            <input 
                                type="date" 
                                name="date" 
                                value={formData.date} 
                                onChange={handleChange}
                                required
                                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontWeight: '500', backgroundColor: '#ffffff', color: '#334155' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Time</label>
                                <input 
                                    type="time" 
                                    name="startTime" 
                                    value={formData.startTime} 
                                    onChange={handleChange}
                                    required
                                    style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontWeight: '500', backgroundColor: '#ffffff', color: '#334155' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End Time</label>
                                <input 
                                    type="time" 
                                    name="endTime" 
                                    value={formData.endTime} 
                                    onChange={handleChange}
                                    required
                                    style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontWeight: '500', backgroundColor: '#ffffff', color: '#334155' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purpose of Request</label>
                            <textarea 
                                name="purpose" 
                                value={formData.purpose} 
                                onChange={handleChange}
                                placeholder="Provide necessary context or requirements..."
                                rows="4"
                                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontWeight: '500', backgroundColor: '#ffffff', color: '#334155', resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 20px', 
                                    backgroundColor: '#ea580c', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    fontWeight: '600', 
                                    fontSize: '0.95rem', 
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#c2410c')}
                                onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#ea580c')}
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => navigate('/bookings')}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 20px', 
                                    background: 'transparent', 
                                    color: '#64748b', 
                                    border: 'none', 
                                    fontWeight: '600', 
                                    fontSize: '0.95rem', 
                                    cursor: 'pointer',
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>

                {/* Right Column: Dynamic Preview Card */}
                <div>
                    {!selectedResource ? (
                        <div style={{ 
                            backgroundColor: '#ffffff', padding: '48px 32px', borderRadius: '12px', 
                            border: '1px dashed #e2e8f0', textAlign: 'center', color: '#64748b',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
                        }}>
                            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p style={{ margin: 0, fontWeight: '500', fontSize: '0.95rem' }}>Select a resource to view details</p>
                        </div>
                    ) : (
                        <div style={{ 
                            borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                            border: '1px solid #e2e8f0'
                        }}>
                            {/* Top Half (Visual) */}
                            <div style={{ 
                                backgroundColor: '#0f172a', 
                                height: '220px', 
                                position: 'relative', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <span style={{ 
                                    position: 'absolute', top: '24px', left: '24px', 
                                    backgroundColor: '#ea580c', color: '#ffffff', 
                                    padding: '6px 14px', borderRadius: '8px', 
                                    fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase'
                                }}>
                                    {selectedResource.type || 'FACILITY'}
                                </span>
                                <svg width="96" height="96" fill="none" stroke="#f8fafc" viewBox="0 0 24 24">
                                    {getResourceIcon(selectedResource.type)}
                                </svg>
                            </div>
                            
                            {/* Bottom Half (Details) */}
                            <div style={{ padding: '32px 24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.2' }}>{selectedResource.name}</h3>
                                    <span style={{ 
                                        backgroundColor: statusStyles.bg, 
                                        color: statusStyles.color, 
                                        padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', border: `1px solid ${statusStyles.border}`
                                    }}>
                                        {selectedResource.status || 'AVAILABLE'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '0.95rem', fontWeight: '500' }}>
                                        <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                            <svg width="20" height="20" fill="none" stroke="#64748b" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <span>{selectedResource.capacity || 'Variable'} Capacity</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '0.95rem', fontWeight: '500' }}>
                                        <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                            <svg width="20" height="20" fill="none" stroke="#64748b" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <span>{selectedResource.location || 'Campus Wide'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewBookingRequest;
