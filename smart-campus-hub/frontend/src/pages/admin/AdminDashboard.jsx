import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Master State for all Dashboard Widgets
    const [dashboardData, setDashboardData] = useState({
        kpis: { pendingBookings: 0, openTickets: 0, totalResources: 0 },
        pendingList: [],
        topResources: [],
        weeklyData: [0, 0, 0, 0, 0, 0, 0] // Monday to Sunday
    });

    // Fetch and calculate all data
    const fetchDashboardData = async () => {
        try {
            const [bookingsRes, ticketsRes, resourcesRes] = await Promise.all([
                api.get('/api/bookings'),
                api.get('/api/tickets'),
                api.get('/api/resources')
            ]);

            const bookings = bookingsRes.data || [];
            const tickets = ticketsRes.data || [];
            const resources = resourcesRes.data || [];

            // 1. Calculate KPIs
            const pendingBookings = bookings.filter(b => b.status === 'PENDING');
            const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'PENDING').length;
            const totalResources = resources.length;

            // 2. Pending Bookings Queue (Take oldest 3)
            const pendingList = pendingBookings.slice(0, 3);

            // 3. Top Booked Resources Aggregation
            const resourceCounts = {};
            bookings.forEach(b => {
                // Adjust this based on your backend DTO structure (b.resource.name or b.resourceId)
                const resName = b.resource?.name || b.resourceName || `Resource ID: ${b.resourceId || 'Unknown'}`;
                resourceCounts[resName] = (resourceCounts[resName] || 0) + 1;
            });
            
            const topResources = Object.entries(resourceCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 4); // Top 4

            // 4. Weekly Data (Mock grouping based on start times/created dates)
            const weeklyData = [0, 0, 0, 0, 0, 0, 0];
            bookings.forEach(b => {
                const dateString = b.startTime || b.createdAt || new Date();
                let dayOfWeek = new Date(dateString).getDay(); 
                let index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sun=0 to Mon=0, Sun=6
                if(index >= 0 && index <= 6) weeklyData[index]++;
            });

            setDashboardData({
                kpis: { pendingBookings: pendingBookings.length, openTickets, totalResources },
                pendingList,
                topResources,
                weeklyData
            });

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
    };

    useEffect(() => {
        // Initial Fetch
        fetchDashboardData();

        // REAL-TIME POLLING: Refresh data automatically every 10 seconds
        const intervalId = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    // Calculate maximum bookings in a single day for the bar chart scaling
    const maxWeeklyBookings = Math.max(...dashboardData.weeklyData, 1);

    return (
        <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Administrative Intelligence</h1>
                    <p style={{ color: '#64748b', margin: 0, marginTop: '4px' }}>Real-time oversight of campus operational throughput. Welcome, {user?.name || 'Admin'}!</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#e2e8f0', color: '#334155', fontWeight: 'bold', cursor: 'pointer' }}>Assign Technician</button>
                    <button onClick={() => navigate('/bookings')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Approve Pending</button>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                
                {/* Dynamic Bar Chart */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, color: '#0f172a' }}>Bookings This Week</h3>
                        <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>LIVE DATA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => {
                            const count = dashboardData.weeklyData[i];
                            // Scale height based on highest day (max 160px)
                            const barHeight = Math.max((count / maxWeeklyBookings) * 160, 10); 
                            const isToday = new Date().getDay() === (i === 6 ? 0 : i + 1);

                            return (
                                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '12px', height: `${barHeight}px`, backgroundColor: isToday ? '#ea580c' : '#0f172a', borderRadius: '6px', transition: 'height 0.5s ease' }}></div>
                                    <span style={{ fontSize: '0.8rem', color: isToday ? '#ea580c' : '#64748b', fontWeight: 'bold' }}>{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Dynamic Square Stat */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                     <h3 style={{ margin: 0, color: '#0f172a', marginBottom: '24px' }}>Ticket Distribution</h3>
                     <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <div style={{ border: '16px solid #0f172a', borderRadius: '16px', width: '180px', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderTopColor: '#ea580c', boxSizing: 'border-box' }}>
                                <h1 style={{ margin: 0, fontSize: '3rem', color: '#0f172a' }}>{dashboardData.kpis.openTickets}</h1>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>OPEN TICKETS</p>
                            </div>
                     </div>
                </div>

                {/* Dynamic Progress Rows */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', marginBottom: '24px' }}>Top Booked Resources</h3>
                    {dashboardData.topResources.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No bookings data available yet.</p>
                    ) : (
                        dashboardData.topResources.map((res, i) => {
                            // Max percentage based on highest booked item
                            const highestCount = dashboardData.topResources[0].count;
                            const percentage = (res.count / highestCount) * 100;

                            return (
                                <div key={res.name} style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>{res.name}</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>{res.count} BOOKINGS</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                                        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#0f172a', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Dynamic Queue */}
                <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, color: '#0f172a' }}>Pending Bookings</h3>
                        <span onClick={() => navigate('/bookings')} style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 'bold', cursor: 'pointer' }}>VIEW ALL</span>
                    </div>
                    {dashboardData.pendingList.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>All caught up! No pending requests.</p>
                    ) : (
                        dashboardData.pendingList.map((booking, index) => (
                            <div key={booking.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${index === 0 ? '#ea580c' : '#cbd5e1'}`, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a', fontSize: '0.9rem' }}>{booking.resource?.name || `Resource #${booking.resourceId}`}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Req by User #{booking.userId || 'Faculty'} • {booking.purpose || 'Pending Review'}</p>
                                </div>
                                <button onClick={() => navigate('/bookings')} style={{ padding: '6px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>View</button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '24px' }}>
                <div onClick={() => navigate('/resources')} style={{ cursor: 'pointer', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a' }}>{dashboardData.kpis.totalResources}</h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '8px' }}>TOTAL RESOURCES</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a' }}>98%</h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '8px' }}>SYSTEM UPTIME</p>
                </div>
                <div onClick={() => navigate('/bookings')} style={{ cursor: 'pointer', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a' }}>{dashboardData.kpis.pendingBookings}</h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '8px' }}>PENDING BOOKINGS</p>
                </div>
                <div onClick={() => navigate('/tickets')} style={{ cursor: 'pointer', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a' }}>{dashboardData.kpis.openTickets}</h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '8px' }}>OPEN TICKETS</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;