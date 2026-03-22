import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', fontFamily: 'var(--font-family)', color: 'var(--text-primary)' }}>
            {/* Header Section */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ color: 'var(--sidebar-bg, #1e293b)', fontWeight: 700, fontSize: '1.8rem', margin: '0 0 8px 0' }}>Administrative Intelligence</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Real-time oversight of campus operational throughput.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0' }}>Assign Technician</button>
                    <button className="btn" style={{ backgroundColor: '#0f172a', color: 'white', fontWeight: 600 }}>Approve Pending</button>
                </div>
            </header>

            {/* Main Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
                
                {/* Widget 1: Bookings This Week (Top Left) */}
                <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Bookings This Week</h2>
                        <span className="badge badge-blue" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE TRAFFIC</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingTop: '20px' }}>
                        {[
                            { day: 'Mon', height: '120px' },
                            { day: 'Tue', height: '150px' },
                            { day: 'Wed', height: '90px' },
                            { day: 'Thu', height: '190px', highlight: true },
                            { day: 'Fri', height: '140px' },
                            { day: 'Sat', height: '60px' },
                            { day: 'Sun', height: '40px' },
                        ].map((bar) => (
                            <div key={bar.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    width: '12px', 
                                    height: bar.height, 
                                    borderRadius: '6px', 
                                    backgroundColor: bar.highlight ? 'var(--accent-orange, #f97316)' : 'var(--sidebar-bg, #1e293b)' 
                                }}></div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{bar.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Widget 2: Ticket Distribution (Top Right) */}
                <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 24px 0', fontWeight: 600 }}>Ticket Distribution</h2>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Large Square Visual */}
                        <div style={{ 
                            width: '200px', height: '200px', 
                            border: '12px solid #0f172a', 
                            borderRadius: '16px', 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>842</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginTop: '8px' }}>TOTAL ACTIVE</span>
                        </div>
                        {/* Legend */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#0f172a' }}></div>
                                Resolved
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--accent-orange, #f97316)' }}></div>
                                In-Progress
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#94a3b8' }}></div>
                                Critical
                            </div>
                        </div>
                    </div>
                </div>

                {/* Widget 3: Top Booked Resources (Bottom Left) */}
                <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 24px 0', fontWeight: 600 }}>Top Booked Resources</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { name: 'GRAND LECTURE HALL', count: '142 Bookings', percent: '85%' },
                            { name: 'BIO-TECH LAB A', count: '98 Bookings', percent: '65%' },
                            { name: 'STUDENT UNION CAFE', count: '76 Bookings', percent: '45%' },
                            { name: 'ROBOTICS WORKSHOP', count: '54 Bookings', percent: '30%' },
                        ].map((resource, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                                    <span>{resource.name}</span>
                                    <span style={{ color: '#64748b' }}>{resource.count}</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: resource.percent, height: '100%', backgroundColor: '#0f172a', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Widget 4: Pending Queue (Bottom Right) */}
                <div className="card" style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', fontWeight: 600 }}>Pending Queue</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                        {[
                            { title: 'Bio-Gen Research Equipment', type: 'Maintenance Request', color: 'var(--accent-orange, #f97316)' },
                            { title: 'Main Auditorium HVAC', type: 'Issue Report', color: '#0f172a' },
                            { title: 'Server Room Access', type: 'Access Request', color: '#0f172a' },
                        ].map((item, i) => (
                            <div key={i} style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                backgroundColor: 'white', padding: '16px', borderRadius: '8px', 
                                borderLeft: `4px solid ${item.color}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        📄
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{item.title}</h3>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{item.type}</p>
                                    </div>
                                </div>
                                <button className="btn" style={{ backgroundColor: '#0f172a', color: 'white', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600 }}>Approve</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '24px' }}>
                {[
                    { title: 'Active Users', value: '4.2k', icon: '👥' },
                    { title: 'System Uptime', value: '98%', icon: '⚡' },
                    { title: 'Tasks Done Today', value: '256', icon: '✓' },
                    { title: 'Unresolved Issues', value: '12', icon: '⚠️' }
                ].map((kpi, i) => (
                    <div key={i} className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '16px', backgroundColor: '#f1f5f9', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                            {kpi.icon}
                        </div>
                        <h3 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.title}</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#0f172a', lineHeight: 1 }}>{kpi.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
