"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X } from "lucide-react"
import classNames from "classnames/bind"
import styles from "./CommentSection.module.scss"

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

const Comment = ({ comment, currentUser }) => {
  const isCurrentUser = comment.user._id === currentUser?._id

  return (
    <div className={cx("comment", { "current-user": isCurrentUser })}>
      <div className={cx("comment-avatar")}>
        <img src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.username} />
      </div>
      <div className={cx("comment-content")}>
        <div className={cx("comment-bubble")}>
          <div className={cx("comment-header")}>
            <span className={cx("comment-username")}>{comment.user.username}</span>
          </div>
          <p className={cx("comment-text")}>{comment.content}</p>
        </div>
        <div className={cx("comment-actions")}>
          <span className={cx("comment-time")}>{formatDate(comment.createdAt)}</span>
          <button className={cx("comment-like")}>Like</button>
          <button className={cx("comment-reply")}>Reply</button>
        </div>
      </div>
    </div>
  )
}

const CommentSection = ({ post, currentUser, isOpen, onClose }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const commentInputRef = useRef(null)
  const commentsContainerRef = useRef(null)

  // Fetch comments when the component mounts or post changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // Mock API call
      setTimeout(() => {
        const mockComments = [
          {
            _id: "c1",
            post_id: post._id,
            user: {
              _id: "user3",
              username: "nguyenthao",
              avatar: "https://randomuser.me/api/portraits/women/33.jpg",
            },
            content: "Tuyệt vời! Tôi cũng đã đến đây vào tuần trước. Cảnh đẹp thật!",
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          },
          {
            _id: "c2",
            post_id: post._id,
            user: {
              _id: "user2",
              username: "tranthiB",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            },
            content: "Hình ảnh rất đẹp! Bạn đã sử dụng máy ảnh gì vậy?",
            createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          },
          {
            _id: "c3",
            post_id: post._id,
            user: {
              _id: "user1",
              username: "nguyenvan",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            },
            content: "Cảm ơn mọi người đã quan tâm! Tôi sẽ chia sẻ thêm nhiều hình ảnh trong thời gian tới.",
            createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          },
        ]
        setComments(mockComments)
        setIsLoading(false)
      }, 500)
    }
  }, [post._id, isOpen])

  // Focus the comment input when the section opens
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus()
      }, 300)
    }
  }, [isOpen])

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight
    }
  }, [comments])

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const newCommentObj = {
      _id: `temp-${Date.now()}`,
      post_id: post._id,
      user: {
        _id: currentUser._id,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      content: newComment,
      createdAt: new Date().toISOString(),
    }

    setComments([...comments, newCommentObj])
    setNewComment("")
  }

  return (
    <div className={cx("comment-section", { open: isOpen, closed: !isOpen })}>
      <div className={cx("comment-section-header")}>
        <h3>Comments ({comments.length})</h3>
        <button className={cx("close-button")} onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className={cx("comments-container")} ref={commentsContainerRef}>
        {isLoading ? (
          <div className={cx("loading-comments")}>Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Comment key={comment._id} comment={comment} currentUser={currentUser} />
          ))
        ) : (
          <div className={cx("no-comments")}>No comments yet. Be the first to comment!</div>
        )}
      </div>

      <form className={cx("comment-form")} onSubmit={handleSubmitComment}>
        <div className={cx("comment-input-container")}>
          <img
            src={currentUser?.avatar || "https://via.placeholder.com/40"}
            alt={currentUser?.username || "User"}
            className={cx("current-user-avatar")}
          />
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={cx("comment-input")}
            ref={commentInputRef}
          />
          <button
            type="submit"
            className={cx("send-button", { active: newComment.trim().length > 0 })}
            disabled={!newComment.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommentSection