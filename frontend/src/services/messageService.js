import axios from "axios";

const API_URL = "http://localhost:3001";

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
      console.log("getConversations response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return { success: false, conversations: [], users: {} };
    }
  }

  async getMessages(conversationId) {
    try {
      const response = await this.api.get(`/api/messages/conversations/${conversationId}`);
      console.log("getMessages response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { success: false, messages: [], isMutualFollow: false };
    }
  }

  async sendMessage(receiverId, content, media = []) {
    try {
      const response = await this.api.post("/api/messages/send", {
        receiverId,
        content,
        media,
      });
      console.log("sendMessage response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async markAsRead(messageId) {
    try {
      const response = await this.api.put(`/api/messages/mark-read/${messageId}`);
      console.log("markAsRead response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async markAllAsRead(conversationId) {
    try {
      const response = await this.api.put(`/api/messages/mark-all-read/${conversationId}`);
      console.log("markAllAsRead response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      throw error;
    }
  }

  async searchFollowUsers(query) {
    try {
      const response = await this.api.get(`/api/users/searchfollow`, {
        params: { q: query },
      });

      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      return { success: false, users: [] };
    }
  }
}

const messageService = new MessageService();
export default messageService;