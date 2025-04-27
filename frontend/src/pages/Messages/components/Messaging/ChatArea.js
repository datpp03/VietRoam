"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./ChatArea.module.scss"
import classNames from "classnames/bind"
import { Send, Paperclip, Smile, Check, CheckCheck, ImageIcon, Phone, Video, X, Info } from "lucide-react"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

const cx = classNames.bind(styles)

// Helper function to format dates
const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  } else {
    return date.toLocaleDateString()
  }
}

// Group messages by date
const groupMessagesByDate = (messages) => {
  const groups = {}

  messages.forEach((message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
  })

  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages,
  }))
}

const MessageBubble = ({ message, isCurrentUser, onImageClick }) => {
  return (
    <div className={cx("message-container", { "current-user": isCurrentUser })}>
      <div className={cx("message-bubble")}>
        {message.content && <p className={cx("message-text")}>{message.content}</p>}

        {message.media && message.media.length > 0 && (
          <div className={cx("message-media")}>
            {message.media.map((media, index) => (
              <div key={index} className={cx("media-item")}>
                {media.type === "image" ? (
                  <img
                    src={media.url || "/placeholder.svg?height=300&width=300"}
                    alt={media.filename || "Image"}
                    className={cx("media-image")}
                    onClick={() => onImageClick(media.url)}
                  />
                ) : media.type === "video" ? (
                  <video src={media.url} controls className={cx("media-video")}>
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className={cx("media-file")}>
                    <Paperclip size={16} />
                    <span>{media.filename || "File"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={cx("message-info")}>
          <span className={cx("message-time")}>{formatTime(message.createdAt)}</span>
          {isCurrentUser && (
            <span className={cx("message-status")}>
              {message.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const ChatArea = ({ conversation, messages, currentUser, chatPartner, onSendMessage, onTyping }) => {
  const [newMessage, setNewMessage] = useState("")
  const [mediaAttachments, setMediaAttachments] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const messageInputRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle typing indicator
  useEffect(() => {
    if (newMessage && !isTyping) {
      setIsTyping(true)
      onTyping(true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        onTyping(false)
      }
    }, 2000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [newMessage, isTyping, onTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto"
      messageInputRef.current.style.height = `${Math.min(messageInputRef.current.scrollHeight, 120)}px`
    }
  }, [newMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (newMessage.trim() || mediaAttachments.length > 0) {
      onSendMessage(newMessage.trim(), mediaAttachments)
      setNewMessage("")
      setMediaAttachments([])
      setIsTyping(false)
      onTyping(false)

      // Reset textarea height
      if (messageInputRef.current) {
        messageInputRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)

    // In a real app, you would upload these files to a server
    // For now, we'll create local URLs
    const newAttachments = files.map((file) => {
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file"

      return {
        type,
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
      }
    })

    setMediaAttachments([...mediaAttachments, ...newAttachments])

    // Reset the file input
    e.target.value = null
  }

  const removeAttachment = (index) => {
    const newAttachments = [...mediaAttachments]
    newAttachments.splice(index, 1)
    setMediaAttachments(newAttachments)
  }

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.native)
    setShowEmojiPicker(false)
    messageInputRef.current?.focus()
  }

  const handleImageClick = (url) => {
    setPreviewImage(url)
  }

  const closeImagePreview = () => {
    setPreviewImage(null)
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className={cx("chat-area")}>
      <div className={cx("chat-header")}>
        <div className={cx("chat-partner-info")}>
          <div className={cx("avatar-container")}>
            <img
              src={chatPartner.avatar || "/placeholder.svg?height=100&width=100"}
              alt={chatPartner.username}
              className={cx("avatar")}
            />
            {chatPartner.isOnline && <span className={cx("online-indicator")}></span>}
          </div>
          <div className={cx("partner-details")}>
            <h3 className={cx("partner-name")}>{chatPartner.username}</h3>
            <p className={cx("partner-status", { typing: chatPartner.isTyping })}>
              {chatPartner.isTyping ? (
                <>
                  Typing
                  <span className={cx("typing-indicator")}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </>
              ) : chatPartner.isOnline ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        <div className={cx("chat-actions")}>
          <button className={cx("action-button")} aria-label="Voice call">
            <Phone size={18} />
          </button>
          <button className={cx("action-button")} aria-label="Video call">
            <Video size={18} />
          </button>
          <button className={cx("action-button")} aria-label="Info">
            <Info size={18} />
          </button>
        </div>
      </div>

      <div className={cx("messages-container")}>
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className={cx("message-group")}>
            <div className={cx("date-separator")}>
              <span>{formatDate(group.date)}</span>
            </div>

            {group.messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isCurrentUser={message.sender_id === currentUser._id}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {mediaAttachments.length > 0 && (
        <div className={cx("attachments-preview")}>
          {mediaAttachments.map((media, index) => (
            <div key={index} className={cx("attachment-item")}>
              {media.type === "image" ? (
                <img
                  src={media.url || "/placeholder.svg?height=100&width=100"}
                  alt={media.filename}
                  className={cx("attachment-thumbnail")}
                />
              ) : media.type === "video" ? (
                <div className={cx("video-thumbnail")}>
                  <span>Video</span>
                </div>
              ) : (
                <div className={cx("file-thumbnail")}>
                  <span>{media.filename}</span>
                </div>
              )}
              <button className={cx("remove-attachment")} onClick={() => removeAttachment(index)}>
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <form className={cx("message-input-container")} onSubmit={handleSendMessage}>
        <button
          type="button"
          className={cx("attachment-button")}
          onClick={() => fileInputRef.current.click()}
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*,application/*"
        />

        <button type="button" className={cx("attachment-button")} aria-label="Attach image">
          <ImageIcon size={20} />
        </button>

        <div className={cx("message-input-wrapper")}>
          <textarea
            ref={messageInputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cx("message-input")}
            rows={1}
          />
        </div>

        <button
          type="button"
          className={cx("emoji-button")}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          aria-label="Emoji"
        >
          <Smile size={20} />
        </button>

        <button
          type="submit"
          className={cx("send-button", { active: newMessage.trim() || mediaAttachments.length > 0 })}
          disabled={!newMessage.trim() && mediaAttachments.length === 0}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>

        {showEmojiPicker && (
          <div className={cx("emoji-picker")}>
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}
      </form>

      {previewImage && (
        <div className={cx("image-preview-modal")} onClick={closeImagePreview}>
          <img src={previewImage || "/placeholder.svg"} alt="Preview" className={cx("preview-image")} />
          <button className={cx("close-preview")} onClick={closeImagePreview}>
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatArea
