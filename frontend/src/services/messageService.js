import axios from 'axios';

const API_URL ='http://localhost:3001';

class MessageService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api/messages`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Thiết lập token cho các request
  setAuthToken(token) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Lấy danh sách cuộc trò chuyện
  async getConversations() {
    try {
      const response = await this.api.get('/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Lấy tin nhắn của một cuộc trò chuyện
  async getMessages(conversationId) {
    try {
      const response = await this.api.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Gửi tin nhắn mới (API dự phòng nếu Socket.IO không hoạt động)
  async sendMessage(receiverId, content, media = []) {
    try {
      const response = await this.api.post('/send', {
        receiverId,
        content,
        media
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markAsRead(messageId) {
    try {
      const response = await this.api.put(`/mark-read/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc
  async markAllAsRead(conversationId) {
    try {
      const response = await this.api.put(`/mark-all-read/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      throw error;
    }
  }
}

// Tạo instance duy nhất
const messageService = new MessageService();
export default messageService;