import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class MessageService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  setAuthToken(token) {
    this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  async getConversations() {
    try {
      const response = await this.api.get("/api/messages/conversations");
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  async getMessages(conversationId) {
    try {
      const response = await this.api.get(`/api/messages/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  async sendMessage(receiverId, content, media = []) {
    try {
      const response = await this.api.post("/api/messages/send", {
        receiverId,
        content,
        media,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async markAsRead(messageId) {
    try {
      const response = await this.api.put(`/api/messages/mark-read/${messageId}`);
      return response.data;
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async markAllAsRead(conversationId) {
    try {
      const response = await this.api.put(`/api/messages/mark-all-read/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      throw error;
    }
  }

  async searchUsers(query) {
    try {
      const response = await this.api.get(`/api/users/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }
}

const messageService = new MessageService();
export default messageService;