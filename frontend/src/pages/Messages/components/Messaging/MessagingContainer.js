
import { useState, useEffect } from "react"
import styles from "./MessagingContainer.module.scss"
import classNames from "classnames/bind"
import ConversationsList from "./ConversationsList"
import ChatArea from "./ChatArea"
import { MessageSquare, ArrowLeft } from "lucide-react"
import socketService from "~/services/socketService"
import messageService from "~/services/messageService"
import { useAuth } from "~/context/AuthContext"

const cx = classNames.bind(styles)

const MessagingContainer = () => {
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState({})
  const [activeConversation, setActiveConversation] = useState(null)
  const [chatPartner, setChatPartner] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([])
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatOnMobile, setShowChatOnMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState("connecting") // connecting, connected, disconnected

  const { user, token } = useAuth() // Lấy thông tin người dùng và token từ context

  // Kiểm tra xem có đang ở chế độ mobile hay không
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobileView()
    window.addEventListener("resize", checkMobileView)

    return () => {
      window.removeEventListener("resize", checkMobileView)
    }
  }, [])

  // Khởi tạo Socket.IO và lấy danh sách cuộc trò chuyện khi component mount
  useEffect(() => {

    // Thiết lập token cho message service
    messageService.setAuthToken(token)

    // Kết nối Socket.IO
    socketService
      .connect(token)
      .onConnect(() => {
        setConnectionStatus("connected")
        // Đăng nhập vào socket với ID người dùng
        socketService.login(user.id)

        // Ẩn thông báo kết nối sau 3 giây
        setTimeout(() => {
          setConnectionStatus("")
        }, 3000)
      })
      .onDisconnect((reason) => {
        setConnectionStatus("disconnected")
      })
      .onNewMessage((message) => {
        // Thêm tin nhắn mới vào cuộc trò chuyện nếu đang mở
        if (activeConversation && activeConversation.conversation_id === message.conversation_id) {
          setConversationMessages((prev) => [...prev, message])

          // Đánh dấu tin nhắn là đã đọc
          socketService.markAsRead(message._id)
        }

        // Cập nhật danh sách cuộc trò chuyện
        updateConversationWithNewMessage(message)
      })
      .onMessageSent((message) => {
        // Thêm tin nhắn đã gửi vào cuộc trò chuyện
        if (activeConversation && activeConversation.conversation_id === message.conversation_id) {
          setConversationMessages((prev) => [...prev, message])
        }
      })
      .onMessageRead(({ messageId, conversationId }) => {
        // Cập nhật trạng thái đã đọc của tin nhắn
        if (activeConversation && activeConversation.conversation_id === conversationId) {
          setConversationMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? { ...msg, is_read: true } : msg)),
          )
        }
      })
      .onUserTyping(({ userId, isTyping }) => {
        // Cập nhật trạng thái đang nhập của người dùng
        if (chatPartner && chatPartner._id === userId) {
          setChatPartner((prev) => ({ ...prev, isTyping }))
        }
      })
      .onUserStatus(({ userId, status }) => {
        // Cập nhật trạng thái online/offline của người dùng
        setUsers((prev) => {
          if (prev[userId]) {
            return {
              ...prev,
              [userId]: {
                ...prev[userId],
                isOnline: status === "online",
              },
            }
          }
          return prev
        })

        // Cập nhật trạng thái của người đang chat
        if (chatPartner && chatPartner._id === userId) {
          setChatPartner((prev) => ({
            ...prev,
            isOnline: status === "online",
          }))
        }
      })
      .onConversationUpdate(({ conversation_id, last_message }) => {
        // Cập nhật tin nhắn cuối cùng của cuộc trò chuyện
        setConversations((prev) =>
          prev.map((conv) => (conv.conversation_id === conversation_id ? { ...conv, last_message } : conv)),
        )
      })
      .onError((error) => {
        console.error("Socket error:", error)
        // Hiển thị thông báo lỗi cho người dùng
      })

    // Lấy danh sách cuộc trò chuyện
    fetchConversations()

    // Cleanup khi component unmount
    return () => {
      socketService.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token])

  // Hàm lấy danh sách cuộc trò chuyện
  const fetchConversations = async () => {
    try {
      setLoading(true)
      const { success, conversations, users } = await messageService.getConversations()

      if (success) {
        setConversations(conversations)
        setUsers(users)

        // Nếu có cuộc trò chuyện, chọn cuộc trò chuyện đầu tiên
        if (conversations.length > 0 && !activeConversation) {
          handleSelectConversation(conversations[0])
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  // Hàm cập nhật cuộc trò chuyện khi có tin nhắn mới
  const updateConversationWithNewMessage = (message) => {
    const { conversation_id, content, sender_id, createdAt } = message

    // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
    setConversations((prevConversations) => {
      const existingConvIndex = prevConversations.findIndex((conv) => conv.conversation_id === conversation_id)

      if (existingConvIndex >= 0) {
        // Cập nhật cuộc trò chuyện hiện có
        const updatedConversations = [...prevConversations]
        const conv = { ...updatedConversations[existingConvIndex] }

        // Cập nhật tin nhắn cuối cùng
        conv.last_message = {
          content: content || "Đã gửi một media",
          sender_id,
          createdAt,
          is_read: false,
        }

        // Tăng số tin nhắn chưa đọc nếu người gửi không phải là người dùng hiện tại
        if (sender_id !== user.id) {
          conv.unread_count = (conv.unread_count || 0) + 1
        }

        // Di chuyển cuộc trò chuyện lên đầu
        updatedConversations.splice(existingConvIndex, 1)
        updatedConversations.unshift(conv)

        return updatedConversations
      } else {
        // Tạo cuộc trò chuyện mới
        const participants = conversation_id.split("_")
        const otherUserId = sender_id === user.id ? message.receiver_id : sender_id

        // Chỉ thêm nếu có thông tin người dùng
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
          }

          return [newConv, ...prevConversations]
        }

        return prevConversations
      }
    })
  }

  // Hàm chọn cuộc trò chuyện
  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation)

    // Tìm người chat (người dùng khác trong cuộc trò chuyện)
    const partnerId = conversation.participants.find((id) => id !== user.id)
    const partner = users[partnerId]

    if (partner) {
      setChatPartner({
        ...partner,
        isOnline: partner.isOnline || false,
        isTyping: false,
      })
    }

    // Đặt lại số tin nhắn chưa đọc trong UI
    setConversations((prev) =>
      prev.map((conv) => (conv._id === conversation._id ? { ...conv, unread_count: 0 } : conv)),
    )

    // Lấy tin nhắn của cuộc trò chuyện
    try {
      const { success, messages } = await messageService.getMessages(conversation.conversation_id)

      if (success) {
        setConversationMessages(messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }

    // Trong chế độ mobile, hiển thị khu vực chat khi chọn cuộc trò chuyện
    if (isMobileView) {
      setShowChatOnMobile(true)
    }
  }

  // Hàm quay lại danh sách cuộc trò chuyện (mobile)
  const handleBackToList = () => {
    setShowChatOnMobile(false)
  }

  // Hàm gửi tin nhắn
  const handleSendMessage = (content, media = []) => {
    if (!activeConversation || (!content && media.length === 0)) return

    // Lấy ID người nhận
    const receiverId = activeConversation.participants.find((id) => id !== user.id)

    // Gửi tin nhắn qua Socket.IO
    socketService.sendMessage(receiverId, content, media)
  }

  // Hàm thông báo đang nhập
  const handleTyping = (isTyping) => {
    if (!activeConversation || !chatPartner) return

    // Lấy ID người nhận
    const receiverId = chatPartner._id

    // Gửi trạng thái đang nhập qua Socket.IO
    socketService.sendTypingStatus(receiverId, isTyping)
  }

  if (loading) {
    return (
      <div className={cx("loading")}>
        <div className={cx("spinner")}></div>
        <span>Đang tải cuộc trò chuyện...</span>
      </div>
    )
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
  )
}

export default MessagingContainer
