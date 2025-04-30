import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginWithGoogle = async (idToken) => {
  const response = await axiosInstance.post('/auth/google-login', { idToken });
  
  return response.data;
};

export const verifyUser = async (token) => {
  const response = await axiosInstance.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};