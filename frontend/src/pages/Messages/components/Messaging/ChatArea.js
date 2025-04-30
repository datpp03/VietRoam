"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ChatArea.module.scss";
import classNames from "classnames/bind";
import { Send, Paperclip, Smile, Check, CheckCheck, ImageIcon, Phone, Video, X, Info } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import axios from "axios";

const cx = classNames.bind(styles);

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
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
  const groups = {};
  messages.forEach((message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages,
  }));
};

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

  useEffect(() => {
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!isMutualFollow || (!newMessage.trim() && mediaAttachments.length === 0)) {
      return;
    }

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
    if (!isMutualFollow) return;

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

      const newAttachments = response.data.media;
      setMediaAttachments([...mediaAttachments, ...newAttachments]);
    } catch (error) {
      console.error("Error uploading media:", error);
    }

    e.target.value = null;
  };

  const removeAttachment = (index) => {
    const newAttachments = [...mediaAttachments];
    newAttachments.splice(index, 1);
    setMediaAttachments(newAttachments);
  };

  const handleEmojiSelect = (emoji) => {
    if (!isMutualFollow) return;
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleImageClick = (url) => {
    setPreviewImage(url);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const groupedMessages = groupMessagesByDate(messages);

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
        {!isMutualFollow && (
          <div className={cx("mutual-follow-notice")}>
            <p>You must both follow each other to send new messages.</p>
          </div>
        )}
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className={cx("message-group")}>
            <div className={cx("date-separator")}>
              <span>{formatDate(group.date)}</span>
            </div>
            {group.messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isCurrentUser={message.sender_id._id === currentUser.id}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {mediaAttachments.length > 0 && isMutualFollow && (
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
          className={cx("attachment-button", { disabled: !isMutualFollow })}
          onClick={() => isMutualFollow && fileInputRef.current.click()}
          aria-label="Attach file"
          disabled={!isMutualFollow}
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
        <button
          type="button"
          className={cx("attachment-button", { disabled: !isMutualFollow })}
          aria-label="Attach image"
          disabled={!isMutualFollow}
        >
          <ImageIcon size={20} />
        </button>
        <div className={cx("message-input-wrapper")}>
          <textarea
            ref={messageInputRef}
            placeholder={isMutualFollow ? "Type a message..." : "Messaging disabled"}
            value={newMessage}
            onChange={(e) => isMutualFollow && setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cx("message-input", { disabled: !isMutualFollow })}
            rows={1}
            disabled={!isMutualFollow}
          />
        </div>
        <button
          type="button"
          className={cx("emoji-button", { disabled: !isMutualFollow })}
          onClick={() => isMutualFollow && setShowEmojiPicker(!showEmojiPicker)}
          aria-label="Emoji"
          disabled={!isMutualFollow}
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
        {showEmojiPicker && isMutualFollow && (
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
  );
};

export default ChatArea;