
import { useState, useRef, useEffect, useMemo } from "react";
import styles from "./ChatArea.module.scss";
import classNames from "classnames/bind";
import { Send, Paperclip, Smile, Check, CheckCheck, ImageIcon, Phone, Video, X, Info } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import axios from "axios";

const cx = classNames.bind(styles);

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
};

const groupMessagesByDate = (messages) => {
  if (process.env.NODE_ENV === "development") {
    console.log("groupMessagesByDate: Input messages:", messages);
  }
  const groups = {};
  messages.forEach((message) => {
    if (!message.createdAt) {
      console.warn("Missing createdAt in message:", message);
      return;
    }
    const date = new Date(message.createdAt);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date in message:", message);
      return;
    }
    const dateString = date.toDateString();
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    groups[dateString].push(message);
  });
  const result = Object.entries(groups).map(([date, messages]) => ({
    date,
    messages: messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
  }));
  if (process.env.NODE_ENV === "development") {
    console.log("groupMessagesByDate: Grouped result:", result);
  }
  return result;
};

const MessageBubble = ({ message, isCurrentUser, onImageClick }) => {
  if (process.env.NODE_ENV === "development") {
    console.log("MessageBubble: Rendering message:", message);
  }

  const renderMedia = (media, index) => {
    if (!media?.url || !media?.type) {
      console.warn("Invalid media in message:", media);
      return null;
    }
    if (media.type === "image") {
      return (
        <img
          key={index}
          src={media.url || "/placeholder.svg?height=300&width=300"}
          alt={media.filename || "Image"}
          className={cx("media-image")}
          onClick={() => onImageClick(media.url)}
        />
      );
    } else if (media.type === "video") {
      return (
        <video key={index} src={media.url} controls className={cx("media-video")}>
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <div key={index} className={cx("media-file")}>
          <Paperclip size={16} />
          <span>{media.filename || "File"}</span>
        </div>
      );
    }
  };

  return (
    <div className={cx("message-container", { "current-user": isCurrentUser })}>
      <div className={cx("message-bubble", { pending: message.tempId })}>
        {message.content && <p className={cx("message-text")}>{message.content}</p>}
        {message.media && message.media.length > 0 && (
          <div className={cx("message-media")}>
            {message.media.map((media, index) => renderMedia(media, index))}
          </div>
        )}
        <div className={cx("message-info")}>
          <span className={cx("message-time")}>{formatTime(message.createdAt)}</span>
          {isCurrentUser && (
            <span className={cx("message-status")}>
              {message.tempId ? (
                <Check size={14} />
              ) : message.is_read ? (
                <CheckCheck size={14} />
              ) : (
                <Check size={14} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatArea = ({ conversation, messages, currentUser, chatPartner, onSendMessage, onTyping, isMutualFollow }) => {
  const [newMessage, setNewMessage] = useState("");
  const [mediaAttachments, setMediaAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  if (process.env.NODE_ENV === "development") {
    console.log("ChatArea: Received messages:", messages);
    console.log("ChatArea: Message count:", messages.length);
    console.log("ChatArea: Message IDs:", messages.map((msg) => msg._id || msg.tempId));
  }

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("ChatArea: Messages updated:", messages);
      console.log("ChatArea: Updated message count:", messages.length);
      console.log("ChatArea: Updated message IDs:", messages.map((msg) => msg._id || msg.tempId));
    }
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (newMessage && !isTyping && isMutualFollow) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, isTyping, onTyping, isMutualFollow]);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto";
      messageInputRef.current.style.height = `${Math.min(messageInputRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("ChatArea: messagesEndRef is not set");
      const container = document.querySelector(`.${cx("messages-container")}`);
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!isMutualFollow || (!newMessage.trim() && mediaAttachments.length === 0)) {
      console.log("handleSendMessage: Cannot send message, isMutualFollow:", isMutualFollow);
      return;
    }

    console.log("handleSendMessage: Sending message, content:", newMessage, "media:", mediaAttachments);
    onSendMessage(newMessage.trim(), mediaAttachments);
    setNewMessage("");
    setMediaAttachments([]);
    setIsTyping(false);
    onTyping(false);
    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && isMutualFollow) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFileSelect = async (e) => {
    if (!isMutualFollow) {
      console.log("handleFileSelect: Cannot upload files, isMutualFollow:", isMutualFollow);
      return;
    }

    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/messages/upload`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("handleFileSelect: Upload response:", response.data);
      const newAttachments = response.data.media;
      setMediaAttachments([...mediaAttachments, ...newAttachments]);
    } catch (error) {
      console.error("handleFileSelect: Error uploading media:", error);
    }

    e.target.value = null;
  };

  const removeAttachment = (index) => {
    console.log("removeAttachment: Removing attachment at index:", index);
    const newAttachments = [...mediaAttachments];
    newAttachments.splice(index, 1);
    setMediaAttachments(newAttachments);
  };

  const handleEmojiSelect = (emoji) => {
    if (!isMutualFollow) {
      console.log("handleEmojiSelect: Cannot add emoji, isMutualFollow:", isMutualFollow);
      return;
    }
    console.log("handleEmojiSelect: Adding emoji:", emoji);
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleImageClick = (url) => {
    console.log("handleImageClick: Opening image preview:", url);
    setPreviewImage(url);
  };

  const closeImagePreview = () => {
    console.log("closeImagePreview: Closing image preview");
    setPreviewImage(null);
  };

  return (
    <div className={cx("chat-area")}>
      <div className={cx("chat-header")}>
        <div className={cx("chat-partner-info")}>
          <div className={cx("avatar-container")}>
            <img
              src={chatPartner.profile_picture || "/placeholder.svg?height=100&width=100"}
              alt={chatPartner.full_name}
              className={cx("avatar")}
            />
            {chatPartner.isOnline && <span className={cx("online-indicator")}></span>}
          </div>
          <div className={cx("partner-details")}>
            <h3 className={cx("partner-name")}>{chatPartner.full_name}</h3>
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
          <button className={cx("action-button")} aria-label="Call">
            <Phone size={20} />
          </button>
          <button className={cx("action-button")} aria-label="Video call">
            <Video size={20} />
          </button>
          <button className={cx("action-button")} aria-label="Info">
            <Info size={20} />
          </button>
        </div>
      </div>
      {!isMutualFollow && (
        <div className={cx("mutual-follow-notice")}>
          <p>You must both follow each other to send new messages.</p>
        </div>
      )}
      <div className={cx("messages-container")}>
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className={cx("message-group")}>
            <div className={cx("date-separator")}>
              <span>{formatDate(group.date)}</span>
            </div>
            {group.messages.map((message) => (
              <MessageBubble
                key={message._id || message.tempId}
                message={message}
                isCurrentUser={
                  message.sender_id?._id === currentUser.id || message.sender_id === currentUser.id
                }
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={cx("message-form")}>
        {mediaAttachments.length > 0 && (
          <div className={cx("attachments-preview")}>
            {mediaAttachments.map((attachment, index) => (
              <div key={index} className={cx("attachment-item")}>
                {attachment.type === "image" ? (
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className={cx("attachment-thumbnail")}
                  />
                ) : attachment.type === "video" ? (
                  <div className={cx("video-thumbnail")}>
                    <Video size={24} />
                    <span>{attachment.filename}</span>
                  </div>
                ) : (
                  <div className={cx("file-thumbnail")}>
                    <Paperclip size={24} />
                    <span>{attachment.filename}</span>
                  </div>
                )}
                <button
                  type="button"
                  className={cx("remove-attachment")}
                  onClick={() => removeAttachment(index)}
                  aria-label="Remove attachment"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className={cx("message-input-container")}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,video/*,.pdf"
            style={{ display: "none" }}
          />
          <button
            type="button"
            className={cx("attachment-button", { disabled: !isMutualFollow })}
            onClick={() => fileInputRef.current?.click()}
            disabled={!isMutualFollow}
            aria-label="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <div className={cx("message-input-wrapper")}>
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className={cx("message-input", { disabled: !isMutualFollow })}
              disabled={!isMutualFollow}
            />
          </div>
          <button
            type="button"
            className={cx("emoji-button", { disabled: !isMutualFollow })}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={!isMutualFollow}
            aria-label="Toggle emoji picker"
          >
            <Smile size={20} />
          </button>
          <button
            type="submit"
            className={cx("send-button", {
              active: isMutualFollow && (newMessage.trim() || mediaAttachments.length > 0),
            })}
            disabled={!isMutualFollow || (!newMessage.trim() && mediaAttachments.length === 0)}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
        {showEmojiPicker && (
          <div className={cx("emoji-picker")}>
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
      </form>
      {previewImage && (
        <div className={cx("image-preview-modal")}>
          <img src={previewImage} alt="Preview" className={cx("preview-image")} />
          <button
            className={cx("close-preview")}
            onClick={closeImagePreview}
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatArea;