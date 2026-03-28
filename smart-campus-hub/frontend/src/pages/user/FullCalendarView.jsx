import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const FullCalendarView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get('/api/bookings');
                const allBookings = response.data || [];

                // Strict Status Filtering (Crucial)
                const activeBookings = allBookings.filter(b => b.status === 'APPROVED' || b.status === 'ACCEPTED');

                // Transform database records into FullCalendar events
                const mappedEvents = activeBookings.map(booking => {
                    // Logic to identify if the booking belongs to the logged-in user
                    const isMine = booking.userId === user?.id || booking.user?.id === user?.id;
                    
                    return {
                        id: booking.id,
                        title: booking.resource?.name || 'Reserved Slot',
                        start: booking.startTime,
                        end: booking.endTime,
                        // Visual Marking: Orange for YOU, Navy for OTHERS
                        backgroundColor: isMine ? '#ea580c' : '#0f172a',
                        borderColor: isMine ? '#ea580c' : '#0f172a',
                        textColor: 'white',
                        extendedProps: {
                            resourceId: booking.resource?.id,
                            description: booking.purpose,
                            status: booking.status,
                            user: booking.user?.name || 'Faculty',
                            isMine: isMine
                        }
                    };
                });

                setEvents(mappedEvents);
                setLoading(false);
            } catch (err) {
                console.error("Calendar sync error:", err);
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
            const intervalId = setInterval(fetchBookings, 10000);
            return () => clearInterval(intervalId);
        }
    }, [user]);

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ 
                backgroundColor: '#ffffff', 
                padding: '32px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                border: '1px solid #e2e8f0'
            }}>
                {/* Header with Legend */}
                <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Schedule Explorer</h1>
                        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Live campus resource availability and your personal sessions.</p>
                    </div>
                    
                    {/* The Legend */}
                    <div style={{ display: 'flex', gap: '24px', backgroundColor: '#f8fafc', padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#ea580c', borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em' }}>MY BOOKINGS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#0f172a', borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em' }}>CAMPUS SESSIONS</span>
                        </div>
                    </div>
                </header>

                {/* The Calendar Engine */}
                <div className="calendar-wrapper" style={{ minHeight: '600px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Syncing with campus servers...</div>
                    ) : (
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,dayGridWeek'
                            }}
                            buttonText={{
                                today: 'Today',
                                month: 'Month',
                                week: 'Week'
                            }}
                            height="auto"
                            eventContent={(eventInfo) => {
                                const { title, extendedProps, start, end } = eventInfo.event;
                                const startTime = start ? new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                const endTime = end ? new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                const timeString = endTime ? `${startTime} - ${endTime}` : startTime;
                                
                                return (
                                    <div style={{ padding: '2px', display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        <b style={{ fontSize: '0.85em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{timeString}</b>
                                        <span style={{ fontSize: '0.8em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title} (ID: {extendedProps.resourceId || 'N/A'})</span>
                                    </div>
                                );
                            }}
                            eventClick={(info) => {
                                const { title, start, end, extendedProps } = info.event;
                                if (extendedProps.isMine) {
                                    navigate('/bookings');
                                } else {
                                    const startDate = start ? new Date(start).toLocaleString() : 'N/A';
                                    const endDate = end ? new Date(end).toLocaleString() : 'N/A';
                                    alert(
                                        `📌 Resource: ${title}\n` +
                                        `🆔 Resource ID: ${extendedProps.resourceId || 'N/A'}\n` +
                                        `🟢 Start Time: ${startDate}\n` +
                                        `🔴 End Time: ${endDate}\n` +
                                        `👤 Requested by: ${extendedProps.user}\n` +
                                        `🕒 Status: ${extendedProps.status}\n` +
                                        `📝 Purpose: ${extendedProps.description || 'N/A'}`
                                    );
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Custom Calendar Theming to match the Architect UI */}
            <style>{`
                .fc { font-family: inherit; }
                .fc-toolbar-title { font-size: 1.25rem !important; color: #0f172a; font-weight: 700; }
                .fc-button { 
                    background-color: #ffffff !important; 
                    border: 1px solid #e2e8f0 !important; 
                    color: #334155 !important; 
                    font-weight: 600 !important; 
                    font-size: 0.95rem !important;
                    text-transform: capitalize !important;
                    transition: all 0.2s !important;
                    box-shadow: none !important;
                }
                .fc-button:hover { background-color: #f8fafc !important; color: #0f172a !important; }
                .fc-button-active { background-color: #0f172a !important; color: white !important; border-color: #0f172a !important; }
                .fc-daygrid-event { border-radius: 6px !important; padding: 4px 8px !important; font-weight: 600 !important; border: none !important; }
                .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #e2e8f0 !important; }
                .fc-col-header-cell { padding: 12px 0 !important; background-color: #f8fafc !important; color: #64748b !important; font-weight: 700 !important; text-transform: uppercase !important; font-size: 0.75rem !important; letter-spacing: 0.05em !important; }
                .fc-scrollgrid { border: 1px solid #e2e8f0 !important; border-radius: 8px; overflow: hidden; }
                .fc-day-today { background-color: #fffaf0 !important; }
                .fc-daygrid-day-number { color: #334155 !important; font-weight: 500 !important; font-size: 0.95rem !important; padding: 8px !important; }
                .fc-day-other .fc-daygrid-day-number { color: #94a3b8 !important; }
            `}</style>
        </div>
    );
};

export default FullCalendarView;