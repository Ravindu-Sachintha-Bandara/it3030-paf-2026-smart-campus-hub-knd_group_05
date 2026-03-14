import React, { useState } from 'react';
import { bookingService } from '../services/bookingService';

const BookingModal = ({ isOpen, onClose, resource }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen || !resource) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Format datetime-local to standard ISO string that Spring Boot expects: YYYY-MM-DDTHH:mm:ss
            // HTML datetime-local uses YYYY-MM-DDTHH:mm, we can just append :00
            const formattedStart = startTime.length === 16 ? `${startTime}:00` : startTime;
            const formattedEnd = endTime.length === 16 ? `${endTime}:00` : endTime;

            const payload = {
                resourceId: resource.id,
                startTime: formattedStart,
                endTime: formattedEnd,
                purpose
            };

            await bookingService.createBooking(payload);
            setSuccess(true);

            // Auto close after 2 seconds
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (err) {
            setError(err.message || 'Failed to create booking. Please check your inputs.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setError('');
        setStartTime('');
        setEndTime('');
        setPurpose('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Book {resource.name}</h2>
                    <button
                        onClick={handleClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                        &times;
                    </button>
                </div>

                {success ? (
                    <div className="modal-body" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ color: 'var(--secondary-color)', margin: '0 0 0.5rem 0' }}>Booking Requested!</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Your request has been submitted and is pending approval.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Start Time</label>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">End Time</label>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Purpose of Booking</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    placeholder="E.g., CS101 Midterm Exam"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={handleClose} disabled={isLoading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Submitting...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
};

export default BookingModal;
