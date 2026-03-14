import apiClient from './apiClient';

export const bookingService = {
    createBooking: async (bookingData) => {
        try {
            const response = await apiClient.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            // Throw the error payload so the frontend can catch 409 Conflict messages cleanly
            if (error.response && error.response.data && error.response.data.error) {
                throw new Error(error.response.data.error);
            }
            throw error;
        }
    },

    getMyBookings: async () => {
        const response = await apiClient.get('/bookings/my');
        return response.data;
    }
};
