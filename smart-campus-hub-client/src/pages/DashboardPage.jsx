import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/NotificationPanel';
import ResourceCard from '../components/ResourceCard';
import BookingModal from '../components/BookingModal';
import { resourceService } from '../services/resourceService';

const DashboardPage = () => {
    const { userRole, logout } = useAuth();

    // State
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isBookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);

    const loadResources = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await resourceService.getAllResources(filterType, filterStatus);
            setResources(data);
        } catch (err) {
            setError('Failed to load facilities catalogue.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load initially and when filters change
    useEffect(() => {
        loadResources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType, filterStatus]);

    const handleBookClick = (resource) => {
        setSelectedResource(resource);
        setBookingModalOpen(true);
    };

    // Client-side search filtering by name or location
    const filteredResources = resources.filter(r => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return r.name.toLowerCase().includes(lowerSearch) ||
            r.location.toLowerCase().includes(lowerSearch);
    });

    return (
        <div className="page-container">
            {/* Header / Nav Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '2rem' }}>Smart Campus Hub</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Facilities & Asset Catalogue</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="badge badge-gray" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                        👤 Role: {userRole}
                    </span>
                    <button onClick={logout} className="btn" style={{ backgroundColor: '#ef4444', color: 'white' }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>


                <div style={{ flex: '1 1 200px' }}>
                    <label className="form-label">Resource Type</label>
                    <select
                        className="input-field"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="LECTURE_HALL">Lecture Halls</option>
                        <option value="LABORATORY">Laboratories</option>
                        <option value="EQUIPMENT">Equipment</option>
                        <option value="MEETING_ROOM">Meeting Rooms</option>
                    </select>
                </div>

                <div style={{ flex: '1 1 200px' }}>
                    <label className="form-label">Status</label>
                    <select
                        className="input-field"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_USE">In Use</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                    </select>
                </div>

                <button className="btn btn-outline" onClick={loadResources} title="Refresh">
                    🔄 Refresh
                </button>
            </div>

            {/* Content Area */}
            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <h2>Loading resources...</h2>
                </div>
            ) : filteredResources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--border-radius)', border: '1px dashed var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No resources found</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Try adjusting your filters or search term.</p>
                </div>
            ) : (
                <div className="grid-cards">
                    {filteredResources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onBook={handleBookClick}
                        />
                    ))}
                </div>
            )}

            {/* Floating Notification Panel */}
            <NotificationPanel />

            {/* Booking Modal (Hidden by default) */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setBookingModalOpen(false)}
                resource={selectedResource}
            />
        </div>
    );
};

export default DashboardPage;
