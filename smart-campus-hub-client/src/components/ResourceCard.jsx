import React from 'react';

const ResourceCard = ({ resource, onBook }) => {
    const getBadgeColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'badge-green';
            case 'IN_USE': return 'badge-yellow';
            case 'MAINTENANCE': return 'badge-red';
            case 'OUT_OF_SERVICE': return 'badge-gray';
            default: return 'badge-gray';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LECTURE_HALL': return '📚';
            case 'LABORATORY': return '🔬';
            case 'EQUIPMENT': return '💻';
            case 'MEETING_ROOM': return '🤝';
            default: return '🏢';
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                            {getIcon(resource.type)} {resource.name}
                        </h3>
                        <p style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            📍 {resource.location}
                        </p>
                    </div>
                    <span className={`badge ${getBadgeColor(resource.status)}`}>
                        {resource.status.replace(/_/g, ' ')}
                    </span>
                </div>
            </div>

            <div className="card-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                    {resource.description || "No description provided."}
                </p>

                {resource.capacity && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <span style={{ marginRight: '0.5rem' }}>👥</span> Capacity: {resource.capacity} people
                    </div>
                )}
            </div>

            <div className="card-footer">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    ID: #{resource.id}
                </span>
                <button
                    className="btn btn-primary"
                    onClick={() => onBook(resource)}
                    disabled={resource.status !== 'AVAILABLE'}
                    title={resource.status !== 'AVAILABLE' ? "Resource is currently unavailable" : ""}
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};

export default ResourceCard;
