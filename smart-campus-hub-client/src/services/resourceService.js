import apiClient from './apiClient';

export const resourceService = {
    getAllResources: async (type = '', status = '') => {
        try {
            const params = {};
            if (type) params.type = type;
            if (status) params.status = status;
            const response = await apiClient.get('/resources', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching resources:', error);
            throw error;
        }
    },

    getResourceById: async (id) => {
        const response = await apiClient.get(`/resources/${id}`);
        return response.data;
    }
};
