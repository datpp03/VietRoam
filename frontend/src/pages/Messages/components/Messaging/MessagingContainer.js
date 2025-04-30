import { useState, useEffect } from "react";
import styles from "./MessagingContainer.module.scss";
import classNames from "classnames/bind";
import ConversationsList from "./ConversationsList";
import ChatArea from "./ChatArea";
import { MessageSquare, ArrowLeft } from "lucide-react";
import messageService from "~/services/messageService";
import { useAuth } from "~/context/AuthContext";
import { useSocketConnection } from "~/hooks/useSocketConnection";
import axios from "axios";

const cx = classNames.bind(styles);

const MessagingContainer = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
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
      return;
    }

    console.log("MessagingContainer: Setting up socket, isConnected:", isConnected);

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
        setTimeout(() => {
          setConnectionStatus("");
        }, 5000);
      });

      socket.on("disconnect", (reason) => {
        setConnectionStatus("disconnected");
      });

      socket.on("connect_error", (error) => {
        setConnectionStatus("disconnected");
        setError(`Socket error: ${error.message}`);
      });

      socket.on("new_message", (message) => {
        if (activeConversation && activeConversation.conversation_id === message.conversation_id) {
          setConversationMessages((prev) => [...prev, message]);
          socket.emit("mark_read", { messageId: message._id });
        }
        updateConversationWithNewMessage(message);
      });

      socket.on("message_sent", (message) => {
        if (activeConversation && activeConversation.conversation_id === message.conversation_id) {
          setConversationMessages((prev) => [...prev, message]);
        }
      });

      socket.on("message_read", ({ messageId, conversationId }) => {
        if (activeConversation && activeConversation.conversation_id === conversationId) {
          setConversationMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? { ...msg, is_read: true } : msg))
          );
        }
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
        setError(error.message || "Unknown error");
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
      setError("Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const updateConversationWithNewMessage = async (message) => {
    const { conversation_id, content, sender_id, createdAt } = message;

    setConversations((prevConversations) => {
      const existingConvIndex = prevConversations.findIndex((conv) => conv.conversation_id === conversation_id);

      if (existingConvIndex >= 0) {
        const updatedConversations = [...prevConversations];
        const conv = { ...updatedConversations[existingConvIndex] };
        conv.last_message = {
          content: content || "Đã gửi một media",
          sender_id,
          createdAt,
          is_read: false,
        };
        if (sender_id !== user.id) {
          conv.unread_count = (conv.unread_count || 0) + 1;
        }
        updatedConversations.splice(existingConvIndex, 1);
        updatedConversations.unshift(conv);
        return updatedConversations;
      } else {
        const participants = conversation_id.split("_");
        const otherUserId = sender_id === user.id ? message.receiver_id : sender_id;

        if (!users[otherUserId]) {
          axios
            .get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users/${otherUserId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setUsers((prev) => ({
                ...prev,
                [otherUserId]: response.data.user,
              }));
            })
            .catch((error) => console.error("MessagingContainer: Error fetching user:", error));
        }

        if (users[otherUserId]) {
          const newConv = {
            _id: conversation_id,
            conversation_id,
            participants,
            last_message: {
              content: content || "Đã gửi một media",
              sender_id,
              createdAt,
              is_read: false,
            },
            unread_count: sender_id !== user.id ? 1 : 0,
          };
          return [newConv, ...prevConversations];
        }

        return prevConversations;
      }
    });
  };

  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    const partnerId = conversation.participants.find((id) => id !== user.id);
    const partner = users[partnerId];

    if (partner) {
      setChatPartner({
        ...partner,
        isOnline: partner.isOnline || false,
        isTyping: false,
      });
    }

    setConversations((prev) =>
      prev.map((conv) => (conv._id === conversation._id ? { ...conv, unread_count: 0 } : conv))
    );

    try {
      const { success, messages, isMutualFollow } = await messageService.getMessages(conversation.conversation_id);
      if (success) {
        setConversationMessages(messages);
        setIsMutualFollow(isMutualFollow);
      }
    } catch (error) {
      setError("Không thể tải tin nhắn. Vui lòng thử lại.");
    }

    if (isMobileView) {
      setShowChatOnMobile(true);
    }
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

  const handleSendMessage = (content, media = []) => {
    if (!activeConversation || (!content && media.length === 0) || !isMutualFollow) {
      return;
    }

    const receiverId = activeConversation.participants.find((id) => id !== user.id);
    socket.emit("private_message", { receiverId, content, media });
  };

  const handleTyping = (isTyping) => {
    if (!activeConversation || !chatPartner || !isMutualFollow) {
      return;
    }

    const receiverId = chatPartner._id;
    socket.emit("typing", { receiverId, isTyping });
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
              messages={conversationMessages}
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