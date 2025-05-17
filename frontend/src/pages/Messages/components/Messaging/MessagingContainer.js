/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import styles from "./MessagingContainer.module.scss";
import classNames from "classnames/bind";
import ConversationsList from "./ConversationsList";
import ChatArea from "./ChatArea";
import { MessageSquare, ArrowLeft } from "lucide-react";
import messageService from "~/services/messageService";
import { useAuth } from "~/contexts/AuthContext";
import { useSocketConnection } from "~/hooks/useSocketConnection";
import axios from "axios";

const cx = classNames.bind(styles);

// Hàm kiểm tra ObjectId hợp lệ bằng regex
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const MessagingContainer = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [pendingMessages, setPendingMessages] = useState({});
  const [isMutualFollow, setIsMutualFollow] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const { user, token } = useAuth();
  const { socket, isConnected, error: socketError } = useSocketConnection(user?.id, token);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  useEffect(() => {
    if (!user || !token) {
      console.log("MessagingContainer: Missing user or token, skipping socket setup");
      setError("Vui lòng đăng nhập để sử dụng tính năng chat");
      return;
    }

    console.log("MessagingContainer: Setting up socket, userId:", user.id, "isConnected:", isConnected);

    messageService.setAuthToken(token);

    setConnectionStatus(isConnected ? "connected" : socketError ? "disconnected" : "connecting");
    if (isConnected) {
      setTimeout(() => {
        setConnectionStatus("");
      }, 5000);
    }

    if (socket) {
      socket.on("connect", () => {
        setConnectionStatus("connected");
        socket.emit("login", user.id);
        console.log("MessagingContainer: Socket connected, emitted login with userId:", user.id);
        setTimeout(() => {
          setConnectionStatus("");
        }, 5000);
      });

      socket.on("disconnect", (reason) => {
        console.log("MessagingContainer: Socket disconnected, reason:", reason);
        setConnectionStatus("disconnected");
      });

      socket.on("connect_error", (error) => {
        console.error("MessagingContainer: Socket connect_error:", error);
        setConnectionStatus("disconnected");
        setError(`Socket error: ${error.message}`);
      });

      socket.on("new_message", (message) => {
        console.log("MessagingContainer: Received new_message:", message);
        // Only add to conversationMessages, not pendingMessages, unless it's a temp message
        setConversationMessages((prev) => {
          const currentMessages = prev[message.conversation_id] || [];
          if (currentMessages.some((msg) => msg._id === message._id)) {
            console.log("MessagingContainer: Duplicate message in conversationMessages, skipping:", message._id);
            return prev;
          }
          const updatedMessages = [...currentMessages, message].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          console.log("MessagingContainer: Updated conversationMessages for", message.conversation_id, ":", updatedMessages);
          return {
            ...prev,
            [message.conversation_id]: updatedMessages,
          };
        });

        if (activeConversation && activeConversation.conversation_id === message.conversation_id) {
          socket.emit("mark_read", { messageId: message._id });
        }

        updateConversationWithNewMessage(message);
      });

      socket.on("message_sent", (message) => {
        console.log("MessagingContainer: message_sent:", message);
        setConversationMessages((prev) => {
          const currentMessages = prev[message.conversation_id] || [];
          if (currentMessages.some((msg) => msg._id === message._id)) {
            console.log("MessagingContainer: Duplicate message in conversationMessages, skipping:", message._id);
            return prev;
          }
          const filteredMessages = currentMessages.filter((msg) => msg.tempId !== message.tempId);
          const updatedMessages = [...filteredMessages, message].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          console.log("MessagingContainer: Updated conversationMessages for", message.conversation_id, ":", updatedMessages);
          return {
            ...prev,
            [message.conversation_id]: updatedMessages,
          };
        });
        // Clear the pending message
        setPendingMessages((prev) => {
          const conversationMessages = (prev[message.conversation_id] || []).filter(
            (msg) => msg.tempId !== message.tempId
          );
          return {
            ...prev,
            [message.conversation_id]: conversationMessages,
          };
        });
      });

      socket.on("message_read", ({ messageId, conversationId }) => {
        setConversationMessages((prev) => {
          const currentMessages = prev[conversationId] || [];
          const updatedMessages = currentMessages.map((msg) =>
            msg._id === messageId ? { ...msg, is_read: true } : msg
          );
          return {
            ...prev,
            [conversationId]: updatedMessages,
          };
        });
      });

      socket.on("user_typing", ({ userId, isTyping }) => {
        if (chatPartner && chatPartner._id === userId) {
          setChatPartner((prev) => ({ ...prev, isTyping }));
        }
      });

      socket.on("user_status", ({ userId, status }) => {
        setUsers((prev) => {
          if (prev[userId]) {
            return {
              ...prev,
              [userId]: { ...prev[userId], isOnline: status === "online" },
            };
          }
          return prev;
        });
        if (chatPartner && chatPartner._id === userId) {
          setChatPartner((prev) => ({ ...prev, isOnline: status === "online" }));
        }
      });

      socket.on("online_users", (onlineUsers) => {
        setUsers((prev) => {
          const updatedUsers = { ...prev };
          Object.keys(updatedUsers).forEach((userId) => {
            updatedUsers[userId].isOnline = onlineUsers.includes(userId);
          });
          return updatedUsers;
        });
      });

      socket.on("conversation_update", ({ conversation_id, last_message }) => {
        setConversations((prev) =>
          prev.map((conv) => (conv.conversation_id === conversation_id ? { ...conv, last_message } : conv))
        );
      });

      socket.on("error", (error) => {
        console.error("MessagingContainer: Socket error event:", error);
        setError(error.message || "Lỗi kết nối máy chủ chat");
      });
    }

    fetchConversations();

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("new_message");
        socket.off("message_sent");
        socket.off("message_read");
        socket.off("user_typing");
        socket.off("user_status");
        socket.off("online_users");
        socket.off("conversation_update");
        socket.off("error");
      }
    };
  }, [user, token, socket, isConnected, socketError]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");
      const { success, conversations, users } = await messageService.getConversations();
      if (success) {
        setConversations(conversations);
        setUsers(users);
        if (conversations.length > 0 && !activeConversation) {
          handleSelectConversation(conversations[0]);
        }
      }
    } catch (error) {
      console.error("MessagingContainer: Error fetching conversations:", error);
      setError("Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const updateConversationWithNewMessage = async (message) => {
    const { conversation_id, content, createdAt } = message;

    const senderId = typeof message.sender_id === "object" ? message.sender_id._id : message.sender_id;
    const receiverId = typeof message.receiver_id === "object" ? message.receiver_id._id : message.receiver_id;
    const otherUserId = senderId === user.id ? receiverId : senderId;

    console.log("updateConversationWithNewMessage: Processing message:", { conversation_id, senderId, receiverId, otherUserId });

    if (!isValidObjectId(otherUserId)) {
      console.error("updateConversationWithNewMessage: Invalid otherUserId:", otherUserId);
      return;
    }

    setConversations((prevConversations) => {
      const existingConvIndex = prevConversations.findIndex((conv) => conv.conversation_id === conversation_id);

      if (existingConvIndex >= 0) {
        const updatedConversations = [...prevConversations];
        const conv = { ...updatedConversations[existingConvIndex] };
        conv.last_message = {
          content: content || "Đã gửi một media",
          sender_id: senderId,
          createdAt,
          is_read: false,
        };
        if (senderId !== user.id && (!activeConversation || activeConversation.conversation_id !== conversation_id)) {
          conv.unread_count = (conv.unread_count || 0) + 1;
        }
        updatedConversations.splice(existingConvIndex, 1);
        updatedConversations.unshift(conv);
        console.log("updateConversationWithNewMessage: Updated existing conversation:", conv);
        return updatedConversations;
      } else {
        const participants = conversation_id.split("_");

        if (!users[otherUserId]) {
          axios
            .get(`http://localhost:3001/api/users/${otherUserId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setUsers((prev) => ({
                ...prev,
                [otherUserId]: response.data.user,
              }));
              console.log("updateConversationWithNewMessage: Fetched user:", response.data.user);
            })
            .catch((error) => console.error("updateConversationWithNewMessage: Error fetching user:", error));
        }

        if (users[otherUserId]) {
          const newConv = {
            _id: conversation_id,
            conversation_id,
            participants,
            last_message: {
              content: content || "Đã gửi một media",
              sender_id: senderId,
              createdAt,
              is_read: false,
            },
            unread_count: senderId !== user.id ? 1 : 0,
          };
          console.log("updateConversationWithNewMessage: Created new conversation:", newConv);
          return [newConv, ...prevConversations];
        }

        console.warn("updateConversationWithNewMessage: User not found, skipping conversation creation");
        return prevConversations;
      }
    });
  };

  const handleSelectConversation = async (conversation) => {
    console.log("handleSelectConversation: conversation:", conversation);

    setActiveConversation(conversation);
    const partnerId = conversation.participants.find((id) => id !== user.id);
    let partner = users[partnerId];

    console.log("handleSelectConversation: partnerId:", partnerId);
    console.log("handleSelectConversation: partner:", partner);

    if (!partner) {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/users/${partnerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        partner = response.data.user;
        setUsers((prev) => ({
          ...prev,
          [partnerId]: partner,
        }));
      } catch (error) {
        console.error("handleSelectConversation: Error fetching user:", error);
        setError("Không thể tải thông tin người dùng.");
        return;
      }
    }

    setChatPartner({
      ...partner,
      isOnline: partner.isOnline || false,
      isTyping: false,
    });

    setConversations((prev) =>
      prev.map((conv) => (conv._id === conversation._id ? { ...conv, unread_count: 0 } : conv))
    );

    try {
      const { success, messages, isMutualFollow } = await messageService.getMessages(conversation.conversation_id);
      console.log("handleSelectConversation: messages:", messages);
      if (success) {
        const pending = (pendingMessages[conversation.conversation_id] || []).filter((msg) => msg.tempId && !msg._id);
        const storedMessages = conversationMessages[conversation.conversation_id] || [];

        // Sử dụng Set để lọc trùng lặp dựa trên _id hoặc tempId
        const messageIds = new Set();
        const uniqueMessages = [];

        // Ưu tiên tin nhắn từ API, sau đó bổ sung tin nhắn tạm thời từ pendingMessages
        [...messages, ...storedMessages].forEach((msg) => {
          if (msg._id && !messageIds.has(msg._id)) {
            messageIds.add(msg._id);
            uniqueMessages.push(msg);
          }
        });

        pending.forEach((msg) => {
          if (msg.tempId && !messageIds.has(msg.tempId) && !messageIds.has(msg._id)) {
            messageIds.add(msg.tempId);
            uniqueMessages.push(msg);
          }
        });

        const allMessages = uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        console.log("handleSelectConversation: combined messages:", allMessages);

        setConversationMessages((prev) => ({
          ...prev,
          [conversation.conversation_id]: allMessages,
        }));
        setPendingMessages((prev) => ({
          ...prev,
          [conversation.conversation_id]: [],
        }));
        setIsMutualFollow(isMutualFollow);

        const unreadMessages = allMessages.filter((msg) => !msg.is_read && msg.sender_id !== user.id);
        for (const msg of unreadMessages) {
          socket.emit("mark_read", { messageId: msg._id });
        }
      }
    } catch (error) {
      console.error("handleSelectConversation: Error fetching messages:", error);
      setError("Không thể tải tin nhắn. Vui lòng thử lại.");
    }

    if (isMobileView) {
      console.log("handleSelectConversation: Setting showChatOnMobile to true");
      setShowChatOnMobile(true);
    }
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

  const handleSendMessage = async (content, media = []) => {
    if (!activeConversation || (!content && media.length === 0) || !isMutualFollow) {
      console.log("MessagingContainer: handleSendMessage skipped, invalid conditions:", {
        activeConversation,
        content,
        media,
        isMutualFollow,
      });
      return;
    }

    if (!user?.id) {
      console.error("MessagingContainer: Missing user.id");
      setError("Không thể gửi tin nhắn, thông tin người dùng không hợp lệ");
      return;
    }

    if (!isConnected || !socket) {
      console.error("MessagingContainer: Socket not connected, cannot send message");
      setError("Không thể gửi tin nhắn, mất kết nối máy chủ");
      return;
    }

    const receiverId = activeConversation.participants.find((id) => id !== user.id);
    if (!receiverId) {
      console.error("MessagingContainer: Missing receiverId, activeConversation.participants:", activeConversation.participants);
      setError("Không thể gửi tin nhắn, không tìm thấy người nhận");
      return;
    }

    console.log("MessagingContainer: Preparing to send message:", { userId: user.id, receiverId, content, media });

    const tempId = `${user.id}-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      tempId,
      conversation_id: activeConversation.conversation_id,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      media,
      createdAt: new Date().toISOString(),
      is_read: false,
    };

    setConversationMessages((prev) => {
      const currentMessages = prev[activeConversation.conversation_id] || [];
      if (currentMessages.some((msg) => msg.tempId === tempId || msg._id === tempId)) {
        console.log("MessagingContainer: Duplicate temp message, skipping:", tempId);
        return prev;
      }
      const updatedMessages = [...currentMessages, tempMessage].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      console.log("MessagingContainer: Added temp message for", activeConversation.conversation_id, ":", updatedMessages);
      return {
        ...prev,
        [activeConversation.conversation_id]: updatedMessages,
      };
    });
    setPendingMessages((prev) => ({
      ...prev,
      [activeConversation.conversation_id]: [...(prev[activeConversation.conversation_id] || []), tempMessage],
    }));

    try {
      socket.emit("private_message", { receiverId, content, media, tempId });
      console.log("MessagingContainer: Emitted private_message:", { receiverId, content, media, tempId });
    } catch (error) {
      console.error("MessagingContainer: Error sending message:", error);
      setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
      setConversationMessages((prev) => {
        const currentMessages = prev[activeConversation.conversation_id] || [];
        return {
          ...prev,
          [activeConversation.conversation_id]: currentMessages.filter((msg) => msg.tempId !== tempId),
        };
      });
      setPendingMessages((prev) => ({
        ...prev,
        [activeConversation.conversation_id]: (prev[activeConversation.conversation_id] || []).filter(
          (msg) => msg.tempId !== tempId
        ),
      }));
    }
  };

  const handleTyping = (isTyping) => {
    if (!activeConversation || !chatPartner || !isMutualFollow) {
      console.log("MessagingContainer: handleTyping skipped, missing activeConversation or chatPartner");
      return;
    }

    if (!isConnected || !socket) {
      console.log("MessagingContainer: handleTyping skipped, socket not connected");
      return;
    }

    const conversationId = activeConversation.conversation_id;
    console.log("MessagingContainer: Emitting typing event:", { conversationId, isTyping });

    socket.emit("typing", { conversationId, isTyping });
  };

  if (loading) {
    return (
      <div className={cx("loading")}>
        <div className={cx("spinner")}></div>
        <span>Đang tải cuộc trò chuyện...</span>
      </div>
    );
  }

  return (
    <div className={cx("messaging-container")}>
      <div
        className={cx("connection-status", {
          visible: connectionStatus !== "",
          connecting: connectionStatus === "connecting",
          connected: connectionStatus === "connected",
          disconnected: connectionStatus === "disconnected",
        })}
      >
        {connectionStatus === "connecting" && "Đang kết nối đến máy chủ chat..."}
        {connectionStatus === "connected" && "Đã kết nối đến máy chủ chat"}
        {connectionStatus === "disconnected" && "Mất kết nối đến máy chủ chat. Đang thử kết nối lại..."}
      </div>
      {error && (
        <div className={cx("error-message")}>
          <span>{error}</span>
        </div>
      )}
      <div
        className={cx("conversations-list-container", {
          hidden: isMobileView && showChatOnMobile,
        })}
      >
        <ConversationsList
          conversations={conversations}
          setConversations={setConversations}
          users={users}
          currentUser={user}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          token={token}
        />
      </div>
      <div
        className={cx("chat-area-container", {
          hidden: isMobileView && !showChatOnMobile,
        })}
      >
        {activeConversation && chatPartner ? (
          <>
            {isMobileView && (
              <button className={cx("back-button")} onClick={handleBackToList}>
                <ArrowLeft size={20} />
                <span>Quay lại</span>
              </button>
            )}
            <ChatArea
              conversation={activeConversation}
              messages={conversationMessages[activeConversation.conversation_id] || []}
              currentUser={user}
              chatPartner={chatPartner}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              isMutualFollow={isMutualFollow}
            />
          </>
        ) : (
          <div className={cx("no-conversation-selected")}>
            <MessageSquare size={60} />
            <h3>Chọn một cuộc trò chuyện</h3>
            <p>Chọn một cuộc trò chuyện từ danh sách hoặc bắt đầu cuộc trò chuyện mới</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingContainer;