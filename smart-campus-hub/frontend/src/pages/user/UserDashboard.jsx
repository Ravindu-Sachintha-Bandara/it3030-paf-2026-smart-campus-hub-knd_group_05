import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
    const { user } = useAuth();

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>
                    Dashboard
                </h1>
                <p style={{ color: '#666', marginTop: '5px' }}>Welcome back to the Smart Campus Hub.</p>
            </header>

            <main>
                <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                        Profile Overview
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Student Name</p>
                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{user?.name || 'Loading...'}</p>
                        </div>
                        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Email Address</p>
                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{user?.email || 'Loading...'}</p>
                        </div>
                        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Role Level</p>
                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>
                                <span style={{ padding: '4px 10px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.9rem' }}>
                                    {user?.role || 'USER'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <h3 style={{ margin: '20px 0 0 0', fontSize: '1.2rem', color: '#334155' }}>University Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>University ID:</span>
                            <span style={{ color: '#334155', fontWeight: '500' }}>STU-88392</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Department:</span>
                            <span style={{ color: '#334155', fontWeight: '500' }}>Computer Science</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Account Status:</span>
                            <span style={{ color: '#10b981', fontWeight: '600' }}>Active</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
