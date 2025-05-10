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

const notificationService = {
  async fetchNotifications(myId) {
    if (!myId) {
      throw new Error('myId không được cung cấp');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`/notifications/${myId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        error: null,
      };
    } catch (err) {
      console.error('Lỗi khi lấy thông báo:', err);
      throw new Error('Không thể tải thông báo');
    }
  },

  async markAsRead(myId, notificationId) {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.patch(
        `/notifications/${myId}/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { success: true };
    } catch (err) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', err);
      throw new Error('Không thể đánh dấu thông báo đã đọc');
    }
  },

  async markAllAsRead(myId) {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.patch(
        `/notifications/${myId}/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { success: true };
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', err);
      throw new Error('Không thể đánh dấu tất cả thông báo đã đọc');
    }
  },
};

export default notificationService;