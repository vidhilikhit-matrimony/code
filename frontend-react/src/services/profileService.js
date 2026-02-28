import api from './api';

/**
 * Create or update profile (with optional photo)
 */
export const createProfile = async (profileData, photoFile, galleryPhotos = []) => {
    // If there's a photo or gallery photos, use FormData
    if (photoFile || galleryPhotos.length > 0) {
        const formData = new FormData();
        Object.entries(profileData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value);
            }
        });

        if (photoFile) {
            formData.append('profilePhoto', photoFile);
        }

        if (galleryPhotos.length > 0) {
            galleryPhotos.forEach((file) => {
                formData.append('galleryImages', file);
            });
        }

        return await api.post('/profiles', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    return await api.post('/profiles', profileData);
};

/**
 * Get current user's profile
 */
export const getMyProfile = async (adminUserId = null) => {
    if (adminUserId) {
        return await api.get(`/profiles/me?adminUserId=${adminUserId}`);
    }
    return await api.get('/profiles/me');
};

/**
 * Get all profiles with filters and pagination
 */
export const getAllProfiles = async (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    });

    return await api.get(`/profiles?${params.toString()}`);
};

/**
 * Get profile by ID
 */
export const getProfileById = async (id) => {
    return await api.get(`/profiles/${id}`);
};

/**
 * Unlock profile
 */
export const unlockProfile = async (id) => {
    return await api.post(`/profiles/${id}/unlock`);
};

/**
 * Delete profile
 */
export const deleteProfile = async (id) => {
    return await api.delete(`/profiles/${id}`);
};
