import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import apiClient from '../../services/apiClient';

const FullCalendarView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Get current user ID from token
                let currentUserId = null;
                const token = localStorage.getItem('authToken');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    currentUserId = payload.sub || payload.id || null;
                }

                const response = await apiClient.get('/bookings');
                const allBookings = response.data || [];

                const mappedEvents = allBookings.map(b => {
                    let isMine = false;
                    const bUserId = b.user?.id || b.userId || b.user?.sub;
                    if (currentUserId && bUserId && String(bUserId) === String(currentUserId)) {
                        isMine = true;
                    }

                    return {
                        id: b.id,
                        title: b.resource?.name || 'Booking',
                        start: b.startTime,
                        end: b.endTime,
                        backgroundColor: isMine ? '#ea580c' : '#1e293b',
                        borderColor: isMine ? '#ea580c' : '#1e293b',
                        textColor: '#ffffff',
                        extendedProps: {
                            status: b.status,
                            resourceName: b.resource?.name || 'Unknown Resource',
                            isMine
                        }
                    };
                });

                setEvents(mappedEvents);
            } catch (error) {
                console.error("Failed to load calendar events", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleEventClick = (info) => {
        const { event } = info;
        const { resourceName, status } = event.extendedProps;
        const timeStr = `${event.start.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })} - ${event.end ? event.end.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) : 'Ongoing'}`;
        
        alert(`Resource: ${resourceName}\nTime: ${timeStr}\nStatus: ${status}`);
    };

    return (
        <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', fontFamily: 'var(--font-family)', color: 'var(--text-primary)' }}>
            
            {/* Header Section */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ color: 'var(--sidebar-bg, #1e293b)', fontWeight: 700, fontSize: '1.8rem', margin: '0 0 8px 0' }}>Schedule Explorer</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Interactive view of all campus engagements and spatial availability.</p>
                </div>
                
                {/* Legend */}
                <div style={{ display: 'flex', gap: '20px', backgroundColor: 'white', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', backgroundColor: '#ea580c', borderRadius: '3px' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>MY BOOKINGS</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', backgroundColor: '#1e293b', borderRadius: '3px' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>OTHER SESSIONS</span>
                    </div>
                </div>
            </header>

            {/* Calendar Container */}
            <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Syncing calendar data...</div>
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek'
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        height="700px"
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: false
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default FullCalendarView;
