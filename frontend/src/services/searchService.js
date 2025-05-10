import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const axiosInstance = axios.create({ baseURL: API_URL });

export const search = async (q, type = 'less') => {
  try {
    if (!q) {
      throw new Error('Query is required');
    }

    const response = await axiosInstance.get('/users/search', {
      params: {
        q,
        type,
      },
    });
  
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error.response?.data || error.message);
    throw error;
  }
};