import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      onConnect: () => {},
      onDisconnect: () => {},
      onNewMessage: () => {},
      onMessageSent: () => {},
      onMessageRead: () => {},
      onUserTyping: () => {},
      onUserStatus: () => {},
      onOnlineUsers: () => {},
      onError: () => {},
      onConversationUpdate: () => {},
    };
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3001', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.callbacks.onConnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.callbacks.onDisconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connect_error:', error);
      this.callbacks.onError(error);
    });

    this.socket.on('new_message', (message) => {
      console.log('New message received:', message);
      this.callbacks.onNewMessage(message);
    });

    this.socket.on('message_sent', (message) => {
      console.log('Message sent confirmation:', message);
      this.callbacks.onMessageSent(message);
    });

    this.socket.on('message_read', (data) => {
      console.log('Message read:', data);
      this.callbacks.onMessageRead(data);
    });

    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data);
      this.callbacks.onUserTyping(data);
    });

    this.socket.on('user_status', (data) => {
      console.log('User status changed:', data);
      this.callbacks.onUserStatus(data);
    });

    this.socket.on('online_users', (users) => {
      console.log('Online users:', users);
      this.callbacks.onOnlineUsers(users);
    });

    this.socket.on('conversation_update', (data) => {
      console.log('Conversation update:', data);
      this.callbacks.onConversationUpdate(data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.callbacks.onError(error);
    });

    return this;
  }

  login(userId) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Socket login:', userId);
    this.socket.emit('login', userId);
  }

  sendMessage(receiverId, content, media = [], tempId) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Sending private_message:', { receiverId, content, media, tempId });
    this.socket.emit('private_message', {
      receiverId,
      content,
      media,
      tempId,
    });
  }

  markAsRead(messageId) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Marking message as read:', messageId);
    this.socket.emit('mark_read', { messageId });
  }

  sendTypingStatus(receiverId, isTyping) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Sending typing status:', { receiverId, isTyping });
    this.socket.emit('typing', { receiverId, isTyping });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onConnect(callback) {
    this.callbacks.onConnect = callback;
    return this;
  }

  onDisconnect(callback) {
    this.callbacks.onDisconnect = callback;
    return this;
  }

  onNewMessage(callback) {
    this.callbacks.onNewMessage = callback;
    return this;
  }

  onMessageSent(callback) {
    this.callbacks.onMessageSent = callback;
    return this;
  }

  onMessageRead(callback) {
    this.callbacks.onMessageSent = callback;
    return this;
  }

  onUserTyping(callback) {
    this.callbacks.onUserTyping = callback;
    return this;
  }

  onUserStatus(callback) {
    this.callbacks.onUserStatus = callback;
    return this;
  }

  onOnlineUsers(callback) {
    this.callbacks.onOnlineUsers = callback;
    return this;
  }

  onError(callback) {
    this.callbacks.onError = callback;
    return this;
  }

  onConversationUpdate(callback) {
    this.callbacks.onConversationUpdate = callback;
    return this;
  }
}

const socketService = new SocketService();
export default socketService;