"use client"

import { useState, useEffect } from "react"
import styles from "./ConversationsList.module.scss"
import classNames from "classnames/bind"
import { Search, Plus, MessageSquare } from "lucide-react"

const cx = classNames.bind(styles)

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

const ConversationItem = ({ conversation, users, currentUser, isActive, onClick }) => {
  // Find the other participant in the conversation
  const partnerId = conversation.participants.find((id) => id !== currentUser._id)
  const partner = users[partnerId]

  if (!partner) return null

  const { last_message, unread_count } = conversation
  const isLastMessageFromMe = last_message?.sender_id === currentUser._id
  const hasUnread = unread_count > 0

  // Truncate the message content if it's too long
  const truncateContent = (content) => {
    if (!content) return ""
    return content.length > 30 ? content.substring(0, 30) + "..." : content
  }

  // Determine if there's media in the last message
  const hasMedia = last_message?.media && last_message.media.length > 0
  const messagePreview = hasMedia
    ? isLastMessageFromMe
      ? "You: Sent a media"
      : "Sent a media"
    : isLastMessageFromMe
      ? `You: ${truncateContent(last_message?.content)}`
      : truncateContent(last_message?.content)

  return (
    <div
      className={cx("conversation-item", {
        active: isActive,
        unread: hasUnread && !isActive,
      })}
      onClick={() => onClick(conversation)}
    >
      <div className={cx("avatar-container")}>
        <img
          src={partner.avatar || "/placeholder.svg?height=100&width=100"}
          alt={partner.username}
          className={cx("avatar")}
        />
        {partner.isOnline && <span className={cx("online-indicator")}></span>}
      </div>

      <div className={cx("conversation-details")}>
        <div className={cx("conversation-header")}>
          <h4 className={cx("username")}>{partner.username}</h4>
          <span className={cx("timestamp")}>{formatDate(last_message?.createdAt)}</span>
        </div>

        <div className={cx("conversation-preview")}>
          <p className={cx("last-message", { unread: hasUnread })}>{messagePreview}</p>

          {hasUnread && <span className={cx("unread-count")}>{unread_count}</span>}
        </div>
      </div>
    </div>
  )
}

const ConversationsList = ({ conversations, users, currentUser, activeConversation, onSelectConversation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConversations, setFilteredConversations] = useState([])

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredConversations(conversations)
      return
    }

    const filtered = conversations.filter((conversation) => {
      const partnerId = conversation.participants.find((id) => id !== currentUser._id)
      const partner = users[partnerId]

      return partner?.username.toLowerCase().includes(searchQuery.toLowerCase())
    })

    setFilteredConversations(filtered)
  }, [searchQuery, conversations, users, currentUser])

  return (
    <div className={cx("conversations-list")}>
      <div className={cx("list-header")}>
        <h2>Messages</h2>
        <button className={cx("new-message-button")} aria-label="New message">
          <Plus size={22} />
        </button>
      </div>

      <div className={cx("search-container")}>
        <Search size={18} className={cx("search-icon")} />
        <input
          type="text"
          placeholder="Search conversations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cx("search-input")}
        />
      </div>

      <div className={cx("conversations-container")}>
        {filteredConversations.length > 0 ? (
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
  )
}

export default ConversationsList
