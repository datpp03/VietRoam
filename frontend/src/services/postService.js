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

export const createPost = async (postData, token) => {
  const response = await axiosInstance.post('/posts', postData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPosts = async () => {
  const response = await axiosInstance.get(`/posts`);
  return response.data;
};

export const getPostsIsLogin = async (myId) => {
  const response = await axiosInstance.get(`/posts/${myId}`);
  return response.data;
};

export const getPostsFollowing = async (myId) => {
  const response = await axiosInstance.get(`/posts/following/${myId}`);
  return response.data;
};

export const getLikedPosts = async (myId) => {
  const response = await axiosInstance.get(`/posts/likes/${myId}`);
  return response.data;
};

export const getPostsUser = async (userId) => {
  const response = await axiosInstance.get(`/posts/user/${userId}`);
  return response.data;
};

export const getMyPosts = async (userId) => {
  const response = await axiosInstance.get(`/myposts/${userId}`);
  return response.data;
};

export const toggleLike = async (postId, userId, token, isLiked) => {
  if (!postId || !userId || !token) {
    console.error('Invalid parameters for toggleLike:', { postId, userId, token });
    throw new Error('Missing required parameters');
  }
  try {
    const response = await axiosInstance({
      method: isLiked ? 'DELETE' : 'POST',
      url: `/posts/${postId}/like`,
      headers: { Authorization: `Bearer ${token}` },
      data: { userId },
    });
    return response.data;
  } catch (error) {
    console.error('toggleLike error:', error.response?.data || error.message);
    throw error;
  }
};

export const deletePost = async (postId, token) => {
  const response = await axiosInstance.delete(`/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const archivePost = async (postId, token) => {
  const response = await axiosInstance.patch(`/posts/${postId}/archive`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updatePostStatus = async (postId, status, visibility, token) => {
  const response = await axiosInstance.patch(`/posts/${postId}/status`, { status, visibility }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getLocationStats = async ({ minPosts, country, city }) => {
  const response = await axiosInstance.get('/posts/location-stats', {
    params: { minPosts, country, city },
  });
  return response.data;
};