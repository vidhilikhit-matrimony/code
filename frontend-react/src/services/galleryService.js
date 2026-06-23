import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: `${API_BASE_URL}/gallery`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getGalleryItems = async (page = 1, limit = 12) => {
  try {
    const response = await api.get(`/?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch gallery items' };
  }
};

export const uploadGalleryItem = async (formData) => {
  try {
    const response = await api.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to upload gallery item' };
  }
};

export const deleteGalleryItem = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete gallery item' };
  }
};
