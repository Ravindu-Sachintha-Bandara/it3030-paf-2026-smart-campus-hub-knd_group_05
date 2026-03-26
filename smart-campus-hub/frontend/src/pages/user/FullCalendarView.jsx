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
                        backgroundColor: isMine ? '#ea580c' : '#1e293b',
                        borderColor: isMine ? '#ea580c' : '#1e293b',
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
        <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '32px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
                {/* Header with Legend */}
                <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem', fontWeight: '800' }}>Schedule Explorer</h1>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '1rem' }}>Live campus resource availability and your personal sessions.</p>
                    </div>
                    
                    {/* The Legend */}
                    <div style={{ display: 'flex', gap: '20px', backgroundColor: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '14px', height: '14px', backgroundColor: '#ea580c', borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>MY BOOKINGS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '14px', height: '14px', backgroundColor: '#1e293b', borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>CAMPUS SESSIONS</span>
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
                .fc-toolbar-title { font-size: 1.4rem !important; color: #1e293b; font-weight: 800; }
                .fc-button { 
                    background-color: #f1f5f9 !important; 
                    border: 1px solid #e2e8f0 !important; 
                    color: #1e293b !important; 
                    font-weight: 700 !important; 
                    text-transform: capitalize !important;
                    transition: all 0.2s !important;
                }
                .fc-button:hover { background-color: #e2e8f0 !important; }
                .fc-button-active { background-color: #1e293b !important; color: white !important; border-color: #1e293b !important; }
                .fc-daygrid-event { border-radius: 6px !important; padding: 4px 8px !important; font-weight: 600 !important; border: none !important; }
                .fc-col-header-cell { padding: 12px 0 !important; background-color: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
                .fc-day-today { background-color: #fffaf0 !important; }
            `}</style>
        </div>
    );
};

export default FullCalendarView;