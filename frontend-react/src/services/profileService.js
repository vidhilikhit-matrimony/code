import api from './api';

/**
 * Create or update profile (with optional photo)
 */
export const createProfile = async (profileData, photoFile, galleryPhotos = [], photosToKeep = []) => {
    // Always use FormData so we can send photosToKeep in edit mode
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

    // Always send a sentinel so the backend runs gallery cleanup even when all photos removed
    formData.append('galleryCleanup', 'true');

    // List of existing gallery photo S3 URLs to keep (empty = delete all existing)
    photosToKeep.forEach((url) => {
        formData.append('photosToKeep', url);
    });

    return await api.post('/profiles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
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
 * Get unlocked profiles
 */
export const getUnlockedProfiles = async () => {
    return await api.get('/profiles/unlocked');
};

/**
 * Delete profile
 */
export const deleteProfile = async (id) => {
    return await api.delete(`/profiles/${id}`);
};
