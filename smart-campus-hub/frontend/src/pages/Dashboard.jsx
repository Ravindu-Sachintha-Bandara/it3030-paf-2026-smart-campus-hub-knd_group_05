import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                // Use the Axios interceptor to automatically attach the JWT
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
                    {user?.role === 'ADMIN' ? 'Admin Dashboard - Resources' : 'My Dashboard - Resources'}
                </h1>
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
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>ID</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Type</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Location</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Capacity</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map((resource) => (
                                <tr key={resource.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '12px' }}>{resource.id}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{resource.name}</td>
                                    <td style={{ padding: '12px' }}>{resource.type}</td>
                                    <td style={{ padding: '12px' }}>{resource.location}</td>
                                    <td style={{ padding: '12px' }}>{resource.capacity}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold',
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
                )}
            </main>
        </div>
    );
};

export default Dashboard;