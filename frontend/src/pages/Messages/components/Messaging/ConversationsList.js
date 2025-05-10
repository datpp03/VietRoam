"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./ConversationsList.module.scss";
import classNames from "classnames/bind";
import { Search, Plus, MessageSquare, X } from "lucide-react";
import messageService from "~/services/messageService";

const cx = classNames.bind(styles);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const ConversationItem = ({ conversation, users, currentUser, isActive, onClick }) => {
  const partnerId = conversation.participants.find((id) => id !== currentUser.id);
  const partner = users[partnerId];

  if (!partner) return null;

  const { last_message, unread_count } = conversation;
  const isLastMessageFromMe = last_message?.sender_id === currentUser.id;
  const hasUnread = unread_count > 0;

  const truncateContent = (content) => {
    if (!content) return "";
    return content.length > 30 ? content.substring(0, 30) + "..." : content;
  };

  const hasMedia = last_message?.media && last_message.media.length > 0;
  const messagePreview = hasMedia
    ? isLastMessageFromMe
      ? "You: Sent a media"
      : "Sent a media"
    : isLastMessageFromMe
      ? `You: ${truncateContent(last_message?.content)}`
      : truncateContent(last_message?.content);

  return (
    <div
      className={cx("conversation-item", { active: isActive, unread: hasUnread && !isActive })}
      onClick={() => onClick(conversation)}
    >
      <div className={cx("avatar-container")}>
        <img
          src={partner.profile_picture || "/placeholder.svg?height=100&width=100"}
          alt={partner.full_name}
          className={cx("avatar")}
        />
        {partner.isOnline && <span className={cx("online-indicator")}></span>}
      </div>
      <div className={cx("conversation-details")}>
        <div className={cx("conversation-header")}>
          <h4 className={cx("username")}>{partner.full_name}</h4>
          <span className={cx("timestamp")}>{formatDate(last_message?.createdAt)}</span>
        </div>
        <div className={cx("conversation-preview")}>
          <p className={cx("last-message", { unread: hasUnread })}>{messagePreview}</p>
          {hasUnread && <span className={cx("unread-count")}>{unread_count}</span>}
        </div>
      </div>
    </div>
  );
};

const UserSearchItem = ({ user, onSelect }) => {
  return (
    <div className={cx("conversation-item")} onClick={() => onSelect(user)}>
      <div className={cx("avatar-container")}>
        <img
          src={user.profile_picture || "/placeholder.svg?height=100&width=100"}
          alt={user.full_name}
          className={cx("avatar")}
        />
        {user.isOnline && <span className={cx("online-indicator")}></span>}
      </div>
      <div className={cx("conversation-details")}>
        <div className={cx("conversation-header")}>
          <h4 className={cx("username")}>{user.full_name}</h4>
        </div>
      </div>
    </div>
  );
};

const ConversationsList = ({ conversations, setConversations, users, currentUser, activeConversation, onSelectConversation, token }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const filteredConversations = useMemo(() => {
    if (!searchQuery || showNewMessage) return conversations;
    return conversations.filter((conversation) => {
      const partnerId = conversation.participants.find((id) => id !== currentUser.id);
      const partner = users[partnerId];
      return partner?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, conversations, users, currentUser, showNewMessage]);

  useEffect(() => {
    if (!showNewMessage || !searchQuery) {
      setSearchUsers([]);
      return;
    }

    const search = async () => {
      try {
        setSearchLoading(true);
        messageService.setAuthToken(token);
        const { success, users } = await messageService.searchFollowUsers(searchQuery);
        if (success) {
          setSearchUsers(users);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, showNewMessage, token]);

  const handleNewMessage = () => {
    setShowNewMessage(true);
    setSearchQuery("");
  };

  const handleSelectUser = (selectedUser) => {
    console.log("handleSelectUser: selectedUser:", selectedUser);
    const conversationId = [currentUser.id, selectedUser._id].sort().join("_");
    console.log("handleSelectUser: conversationId:", conversationId);

    let existingConversation = conversations.find((conv) => conv.conversation_id === conversationId);
    console.log("handleSelectUser: existingConversation:", existingConversation);

    if (!existingConversation) {
      const newConversation = {
        _id: conversationId,
        conversation_id: conversationId,
        participants: [currentUser.id, selectedUser._id],
        last_message: null,
        unread_count: 0,
      };
      console.log("handleSelectUser: Creating new conversation:", newConversation);
      setConversations((prev) => [newConversation, ...prev]);
      existingConversation = newConversation;
    }

    onSelectConversation(existingConversation);
    setShowNewMessage(false);
    setSearchQuery("");
    setSearchUsers([]);
  };

  const handleCloseNewMessage = () => {
    setShowNewMessage(false);
    setSearchQuery("");
    setSearchUsers([]);
  };

  return (
    <div className={cx("conversations-list")}>
      <div className={cx("list-header")}>
        <h2>{showNewMessage ? "New Message" : "Messages"}</h2>
        {!showNewMessage ? (
          <button className={cx("new-message-button")} onClick={handleNewMessage} aria-label="New message">
            <Plus size={22} />
          </button>
        ) : (
          <button className={cx("new-message-button")} onClick={handleCloseNewMessage} aria-label="Close">
            <X size={22} />
          </button>
        )}
      </div>
      <div className={cx("search-container")}>
        <Search size={18} className={cx("search-icon")} />
        <input
          type="text"
          placeholder={showNewMessage ? "Search mutual followers..." : "Search conversations"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cx("search-input")}
        />
      </div>
      <div className={cx("conversations-container")}>
        {showNewMessage ? (
          searchLoading ? (
            <div className={cx("no-conversations")}>
              <span>Loading...</span>
            </div>
          ) : searchUsers.length > 0 ? (
            searchUsers.map((user) => (
              <UserSearchItem key={user._id} user={user} onSelect={handleSelectUser} />
            ))
          ) : (
            <div className={cx("no-conversations")}>
              <Search size={40} />
              <h3>No mutual followers found</h3>
              <p>Try a different search term or follow someone to start messaging</p>
            </div>
          )
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              users={users}
              currentUser={currentUser}
              isActive={activeConversation?._id === conversation._id}
              onClick={onSelectConversation}
            />
          ))
        ) : (
          <div className={cx("no-conversations")}>
            {searchQuery ? (
              <>
                <Search size={40} />
                <h3>No results found</h3>
                <p>We couldn't find any conversations matching "{searchQuery}"</p>
              </>
            ) : (
              <>
                <MessageSquare size={40} />
                <h3>No conversations yet</h3>
                <p>Start a new conversation by clicking the plus button above</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;