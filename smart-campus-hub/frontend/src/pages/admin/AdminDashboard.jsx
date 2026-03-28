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
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ color: '#0f172a', fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.025em' }}>Administrative Intelligence</h1>
                    <p style={{ color: '#64748b', margin: 0, marginTop: '8px', fontSize: '1rem', fontWeight: '500' }}>Real-time oversight of campus operational throughput. Welcome, {user?.name || 'Admin'}!</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>Assign Technician</button>
                    <button onClick={() => navigate('/bookings')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ea580c', color: '#ffffff', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)' }}>Approve Pending</button>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                
                {/* Dynamic Bar Chart */}
                <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>Bookings This Week</h3>
                        <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', border: '1px solid #bfdbfe' }}>LIVE DATA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => {
                            const count = dashboardData.weeklyData[i];
                            // Scale height based on highest day (max 160px)
                            const barHeight = Math.max((count / maxWeeklyBookings) * 160, 10); 
                            const isToday = new Date().getDay() === (i === 6 ? 0 : i + 1);

                            return (
                                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '12px', height: `${barHeight}px`, backgroundColor: isToday ? '#ea580c' : '#0f172a', borderRadius: '6px', transition: 'height 0.5s ease' }}></div>
                                    <span style={{ fontSize: '0.75rem', color: isToday ? '#ea580c' : '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Dynamic Square Stat */}
                <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                     <h3 style={{ margin: 0, color: '#0f172a', marginBottom: '32px', fontSize: '1.25rem', fontWeight: '700' }}>Ticket Distribution</h3>
                     <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <div style={{ border: '12px solid #f8fafc', borderRadius: '50%', width: '180px', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderTopColor: '#ea580c', boxSizing: 'border-box' }}>
                                <h1 style={{ margin: 0, fontSize: '3rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>{dashboardData.kpis.openTickets}</h1>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginTop: '4px', letterSpacing: '0.05em' }}>OPEN TICKETS</p>
                            </div>
                     </div>
                </div>

                {/* Dynamic Progress Rows */}
                <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', marginBottom: '32px', fontSize: '1.25rem', fontWeight: '700' }}>Top Booked Resources</h3>
                    {dashboardData.topResources.length === 0 ? (
                        <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.95rem' }}>No bookings data available yet.</p>
                    ) : (
                        dashboardData.topResources.map((res, i) => {
                            // Max percentage based on highest booked item
                            const highestCount = dashboardData.topResources[0].count;
                            const percentage = (res.count / highestCount) * 100;

                            return (
                                <div key={res.name} style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a' }}>{res.name}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em' }}>{res.count} BOOKINGS</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#0f172a', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Dynamic Queue */}
                <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>Pending Bookings</h3>
                        <span onClick={() => navigate('/bookings')} style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.05em' }}>VIEW ALL</span>
                    </div>
                    {dashboardData.pendingList.length === 0 ? (
                        <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '40px', fontSize: '0.95rem' }}>All caught up! No pending requests.</p>
                    ) : (
                        dashboardData.pendingList.map((booking, index) => (
                            <div key={booking.id} style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: `4px solid ${index === 0 ? '#ea580c' : '#e2e8f0'}`, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>{booking.resource?.name || `Resource #${booking.resourceId}`}</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Req by User #{booking.userId || 'Faculty'} • {booking.purpose || 'Pending Review'}</p>
                                </div>
                                <button onClick={() => navigate('/bookings')} style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>View</button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '24px' }}>
                <div onClick={() => navigate('/resources')} style={{ cursor: 'pointer', backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>{dashboardData.kpis.totalResources}</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginTop: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TOTAL RESOURCES</p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.025em' }}>98%</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginTop: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>SYSTEM UPTIME</p>
                </div>
                <div onClick={() => navigate('/bookings')} style={{ cursor: 'pointer', backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#ea580c', fontWeight: '800', letterSpacing: '-0.025em' }}>{dashboardData.kpis.pendingBookings}</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginTop: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>PENDING BOOKINGS</p>
                </div>
                <div onClick={() => navigate('/tickets')} style={{ cursor: 'pointer', backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#dc2626', fontWeight: '800', letterSpacing: '-0.025em' }}>{dashboardData.kpis.openTickets}</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginTop: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>OPEN TICKETS</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;