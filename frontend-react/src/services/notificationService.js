import api from './api';

/**
 * Get the current active global notification
 */
export const getActiveGlobalNotification = async () => {
    return await api.get('/notifications/global');
};

/**
 * Create/Broadcast a new global notification (Admin only)
 */
export const createGlobalNotification = async (data) => {
    return await api.post('/notifications/global', data);
};

/**
 * Disable the current active global notification (Admin only)
 */
export const disableGlobalNotification = async () => {
    return await api.delete('/notifications/global');
};
