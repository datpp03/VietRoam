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

export const getComments = async (postId, token) => {
  const response = await axiosInstance.get(`/posts/${postId}/comments`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const createComment = async (postId, content, token) => {
  const response = await axiosInstance.post(`/posts/${postId}/comments`, { content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};