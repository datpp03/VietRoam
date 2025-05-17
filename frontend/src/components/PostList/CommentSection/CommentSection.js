import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import classNames from "classnames/bind";
import styles from "./CommentSection.module.scss";
import { useAuth } from "~/contexts/AuthContext";
import { getComments, createComment } from "~/services/commentService";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

// Helper function to format dates
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

const Comment = ({ comment, currentUser }) => {
  const isCurrentUser = comment.user?._id === currentUser?._id;
  
  // Tạo username từ email hoặc full_name nếu email không tồn tại
  const username = comment.user?.email
    ? comment.user.email.split('@')[0]
    : comment.user?.full_name?.toLowerCase().replace(/\s+/g, '') || 'unknown';

  return (
    <div className={cx("comment", { "current-user": isCurrentUser })}>
      <Link to={`/@${username}`} className={cx("user-link")}>
        <div className={cx("comment-avatar")}>
          <img
            src={comment.user?.profile_picture || "/placeholder.svg"}
            alt={comment.user?.full_name || "User"}
          />
        </div>
      </Link>
      <div className={cx("comment-content")}>
        <div className={cx("comment-bubble")}>
          <div className={cx("comment-header")}>
            <span className={cx("comment-username")}>
              {comment.user?.full_name || "Unknown User"}
            </span>
          </div>
          <p className={cx("comment-text")}>{comment.content}</p>
        </div>
        <div className={cx("comment-actions")}>
          <span className={cx("comment-time")}>{formatDate(comment.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ post, currentUser, isOpen, onClose }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const commentInputRef = useRef(null);
  const commentsContainerRef = useRef(null);

  // Fetch comments from backend
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getComments(post._id, token)
        .then((data) => {
          setComments(data.comments || []);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching comments:', error);
          setIsLoading(false);
        });
    }
  }, [post._id, isOpen, token]);

  // Focus the comment input when the section opens
  useEffect(() => {
    if (isOpen && commentInputRef.current && user) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 300);
    }
  }, [isOpen, user]);

  // Scroll to bottom when new comments are added
  useEffect (() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !token) return;

    try {
      const data = await createComment(post._id, newComment.trim(), token);
      setComments([...comments, data.comment]);
      setNewComment("");
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };
  
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

      {user ? (
        <form className={cx("comment-form")} onSubmit={handleSubmitComment}>
          <div className={cx("comment-input-container")}>
            <img
              src={user?.avatar || "https://via.placeholder.com/40"}
              alt={user?.full_name || "User"}
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
      ) : (
        <div className={cx("comment-form")}>
          <p style={{ textAlign: 'center', color: '#888' }}>Please log in to comment</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;