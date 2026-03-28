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
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' }}>
            
            {/* Page Header */}
            <div style={{ marginBottom: '40px', maxWidth: '900px', margin: '0 auto 40px auto' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>
                    New Ticket Request
                </h1>
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
                    Submit a new support ticket or report an incident. Fill in the details below to initiate the request.
                </p>
            </div>

            {/* Main Form Card */}
            <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', 
                border: '1px solid #e2e8f0',
                padding: '40px',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0f172a', 
                        color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: '0.85rem', fontWeight: '800' 
                    }}>
                        01
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>
                        TICKET INFORMATION
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Form Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        
                        {/* Subject */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                    padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                                    backgroundColor: '#ffffff', color: '#334155', fontSize: '0.95rem', fontWeight: '500', outline: 'none', transition: 'border 0.2s' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #94a3b8'}
                                onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                            />
                        </div>

                        {/* Category */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Category
                            </label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ 
                                    padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                                    backgroundColor: '#ffffff', color: '#334155', fontSize: '0.95rem', fontWeight: '500', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #94a3b8'}
                                onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                            >
                                <option value="Facilities">Facilities</option>
                                <option value="IT & Equipment">IT & Equipment</option>
                                <option value="Academic & Exams">Academic & Exams</option>
                                <option value="Transport">Transport</option>
                                <option value="Student Service">Student Service</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Location (Building/Room)
                            </label>
                            <input 
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Science North, Floor 3"
                                style={{ 
                                    padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                                    backgroundColor: '#ffffff', color: '#334155', fontSize: '0.95rem', fontWeight: '500', outline: 'none', transition: 'border 0.2s' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #94a3b8'}
                                onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                            />
                        </div>

                        {/* Priority */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Priority
                            </label>
                            <select 
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                style={{ 
                                    padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                                    backgroundColor: '#ffffff', color: '#334155', fontSize: '0.95rem', fontWeight: '500', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #94a3b8'}
                                onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                            >
                                <option value="Low">Low</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        {/* Description - Full Width */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                    padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                                    backgroundColor: '#ffffff', color: '#334155', fontSize: '0.95rem', fontWeight: '500', outline: 'none', transition: 'border 0.2s', resize: 'vertical' 
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #94a3b8'}
                                onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                            ></textarea>
                        </div>
                    </div>

                    {/* Actions - Bottom Right Container */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                        <button 
                            type="button"
                            onClick={() => navigate('/tickets')}
                            style={{ 
                                background: 'transparent', border: 'none', color: '#64748b', 
                                fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' 
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                        >
                            Cancel
                        </button>

                        <button 
                            type="submit"
                            disabled={submitting}
                            style={{ 
                                backgroundColor: '#ea580c', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', 
                                border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer', 
                                boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)', transition: 'background-color 0.2s' 
                            }}
                            onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#c2410c')}
                            onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#ea580c')}
                        >
                            {submitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default NewTicketRequest;
