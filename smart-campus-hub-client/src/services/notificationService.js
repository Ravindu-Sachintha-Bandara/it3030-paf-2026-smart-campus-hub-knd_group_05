import apiClient from './apiClient';

export const notificationService = {

    fetchNotifications: async (unreadOnly = false) => {
        try {
            const response = await apiClient.get('/notifications', {
                params: { unreadOnly }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    markAsRead: async (id) => {
        try {
            const response = await apiClient.patch(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async () => {
        try {
            const response = await apiClient.patch('/notifications/read-all');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
};
