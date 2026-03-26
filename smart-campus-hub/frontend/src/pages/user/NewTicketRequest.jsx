import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NewTicketRequest = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Hardware',
        location: '',
        priority: 'Normal',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description) {
            alert('Please provide a subject and description.');
            return;
        }

        setSubmitting(true);
        try {
            // Embed location and priority into the description since the backend mapping doesn't natively support them yet
            const finalDescription = `[Priority: ${formData.priority}] [Location: ${formData.location || 'Not Specified'}]\n\n${formData.description}`;

            const payload = {
                title: formData.title,
                category: formData.category.toUpperCase().replace(' ', '_'),
                description: finalDescription,
                status: 'OPEN',
                reporter: { id: user.id } 
            };

            await api.post('/api/tickets', payload);
            navigate('/tickets');
        } catch (error) {
            console.error('Failed to submit ticket:', error);
            alert('Failed to submit ticket. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* Page Header */}
            <div style={{ marginBottom: '40px', maxWidth: '900px', margin: '0 auto 40px auto' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#1e293b', fontWeight: '900', letterSpacing: '-1px' }}>
                    New Ticket Request
                </h1>
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1.05rem' }}>
                    Submit a new support ticket or report an incident. Fill in the details below to initiate the request.
                </p>
            </div>

            {/* Main Form Card */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)', 
                border: '1px solid #f1f5f9',
                padding: '40px',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e3a8a', 
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: '0.8rem', fontWeight: '900' 
                    }}>
                        01
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a', fontWeight: '800', letterSpacing: '1px' }}>
                        TICKET INFORMATION
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Form Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        
                        {/* Subject */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Subject / Title
                            </label>
                            <input 
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Wi-Fi Issue in Library"
                                required
                                style={{ 
                                    padding: '12px 16px', borderRadius: '8px', border: '1px solid transparent', 
                                    backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #cbd5e1'}
                                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                            />
                        </div>

                        {/* Category */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Category
                            </label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ 
                                    padding: '12px 16px', borderRadius: '8px', border: '1px solid transparent', 
                                    backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '1rem', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #cbd5e1'}
                                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                            >
                                <option value="Hardware">Hardware</option>
                                <option value="Software">Software</option>
                                <option value="Network">Network</option>
                                <option value="Facility Maintenance">Facility Maintenance</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Location (Building/Room)
                            </label>
                            <input 
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Science North, Floor 3"
                                style={{ 
                                    padding: '12px 16px', borderRadius: '8px', border: '1px solid transparent', 
                                    backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #cbd5e1'}
                                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                            />
                        </div>

                        {/* Priority */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Priority
                            </label>
                            <select 
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                style={{ 
                                    padding: '12px 16px', borderRadius: '8px', border: '1px solid transparent', 
                                    backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '1rem', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #cbd5e1'}
                                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                            >
                                <option value="Low">Low</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        {/* Description - Full Width */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Description
                            </label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Detail the technical issue or support required..."
                                rows="6"
                                required
                                style={{ 
                                    padding: '16px', borderRadius: '8px', border: '1px solid transparent', 
                                    backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '1rem', outline: 'none', transition: 'border 0.2s', resize: 'vertical' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #cbd5e1'}
                                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                            ></textarea>
                        </div>
                    </div>

                    {/* Actions - Bottom Right Container */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                        <button 
                            type="button"
                            onClick={() => navigate('/tickets')}
                            style={{ 
                                background: 'transparent', border: 'none', color: '#64748b', 
                                fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', letterSpacing: '0.5px', transition: 'color 0.2s' 
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#1e293b'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                        >
                            CANCEL / DISCARD
                        </button>

                        <button 
                            type="submit"
                            disabled={submitting}
                            style={{ 
                                backgroundColor: '#ea580c', color: 'white', padding: '14px 32px', borderRadius: '8px', 
                                border: 'none', fontWeight: '800', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', 
                                boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)', letterSpacing: '0.5px', transition: 'background-color 0.2s' 
                            }}
                            onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#c2410c')}
                            onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#ea580c')}
                        >
                            {submitting ? 'SUBMITTING...' : 'SUBMIT TICKET'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default NewTicketRequest;
