import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Resources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await api.get('/api/resources');
                setResources(response.data);
            } catch (err) {
                console.error('Error fetching resources:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Session expired or unauthorized. Please log in again.');
                } else {
                    setError('Failed to load resources.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>
                    Campus Resources
                </h1>
                <p style={{ color: '#666', marginTop: '5px' }}>Browse available campus facilities and equipment.</p>
            </header>

            <main>
                {error && (
                    <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <p>Loading resources...</p>
                ) : resources.length === 0 ? (
                    <p>No resources found.</p>
                ) : (
                    <div className="card-container" style={{ overflow: 'x-auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', textTransform: 'uppercase', fontSize: '13px', color: '#555', borderBottom: '2px solid #e9ecef' }}>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Location</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Capacity</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map((resource) => (
                                    <tr key={resource.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                        <td style={{ padding: '15px', color: '#333' }}>#{resource.id}</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{resource.name}</td>
                                        <td style={{ padding: '15px' }}>{resource.type}</td>
                                        <td style={{ padding: '15px' }}>{resource.location}</td>
                                        <td style={{ padding: '15px' }}>{resource.capacity}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold',
                                                backgroundColor: resource.status === 'AVAILABLE' ? '#d4edda' : '#f8d7da',
                                                color: resource.status === 'AVAILABLE' ? '#155724' : '#721c24'
                                            }}>
                                                {resource.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Resources;
