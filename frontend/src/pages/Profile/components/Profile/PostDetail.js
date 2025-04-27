"use client"

import { useState, useEffect, useRef } from "react"
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Send,
  MoreHorizontal,
  Trash2,
  Edit3,
} from "lucide-react"
import styles from "./PostDetail.module.scss"
import classNames from "classnames/bind"
import { formatTimeAgo } from "~/utils/dateUtils"
import { sampleUsers, sampleComments } from "./sampleData"

const cx = classNames.bind(styles)

const PostDetail = ({ post, onClose, onNext, onPrev, hasNext, hasPrev, currentUser }) => {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [showOptions, setShowOptions] = useState(false)
  const commentInputRef = useRef(null)
  const modalRef = useRef(null)
  const optionsRef = useRef(null)

  useEffect(() => {
    // Simulate API fetch for comments
    setLoading(true)
    setTimeout(() => {
      // Get comments for this post
      const postComments = sampleComments.filter((comment) => comment.post_id === post._id)
      setComments(postComments)
      setLoading(false)
    }, 500)

    // Reset state when post changes
    setLiked(false)
    setLikesCount(post.likes_count)
    setNewComment("")
    setShowOptions(false)

    // Prevent body scrolling
    document.body.style.overflow = "hidden"

    // Cleanup
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [post])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showOptions])

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }



  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    // Create a new comment
    const newCommentObj = {
      _id: `comment_${Date.now()}`,
      post_id: post._id,
      user_id: "user123", // Current user ID
      content: newComment,
      created_at: new Date().toISOString(),
      likes_count: 0,
    }

    // Add to comments
    setComments([...comments, newCommentObj])
    setNewComment("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  const handleModalClick = (e) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  const handleDeletePost = () => {
    // In a real app, you would make an API call to delete the post
    alert("Bài viết sẽ bị xóa (chức năng này sẽ được triển khai sau)")
    setShowOptions(false)
    onClose()
  }

  const handleEditPost = () => {
    // In a real app, you would navigate to edit post page or show edit modal
    alert("Chỉnh sửa bài viết (chức năng này sẽ được triển khai sau)")
    setShowOptions(false)
  }

  // Find post author
  const author = sampleUsers.find((user) => user._id === post.user_id) || {
    full_name: "Unknown User",
    profile_picture: "/images/default-avatar.jpg",
  }

  return (
    <div
      className={cx("post-detail-modal")}
      onClick={handleModalClick}
      onKeyDown={handleKeyDown}
      ref={modalRef}
      tabIndex={0}
    >
      <div className={cx("modal-content")}>
        <button className={cx("close-button")} onClick={onClose}>
          <X size={24} />
        </button>

        {hasPrev && (
          <button className={cx("nav-button", "prev")} onClick={onPrev}>
            <ChevronLeft size={24} />
          </button>
        )}

        {hasNext && (
          <button className={cx("nav-button", "next")} onClick={onNext}>
            <ChevronRight size={24} />
          </button>
        )}

        <div className={cx("post-container")}>
          <div className={cx("media-container")}>
            {post.media && post.media.length > 0 && (
              <>
                {post.media[0].type === "image" ? (
                  <img
                    src={post.media[0].url || "/placeholder.svg?height=600&width=600"}
                    alt={post.content}
                    className={cx("post-media")}
                  />
                ) : (
                  <video
                    src={post.media[0].url}
                    controls
                    className={cx("post-media")}
                    poster={post.thumbnail_url || "/placeholder.svg?height=600&width=600"}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </>
            )}
          </div>

          <div className={cx("post-info")}>
            <div className={cx("post-header")}>
              <div className={cx("user-info")}>
                <img
                  src={author.profile_picture || "/images/default-avatar.jpg"}
                  alt={author.full_name}
                  className={cx("user-avatar")}
                />
                <div className={cx("user-details")}>
                  <span className={cx("user-name")}>{author.full_name}</span>
                  <span className={cx("post-time")}>{formatTimeAgo(post.created_at)}</span>
                </div>
              </div>

              <div className={cx("post-actions-container")}>
                {currentUser && (
                  <div className={cx("options-container")} ref={optionsRef}>
                    <button className={cx("options-button")} onClick={() => setShowOptions(!showOptions)}>
                      <MoreHorizontal size={20} />
                    </button>

                    {showOptions && (
                      <div className={cx("options-menu")}>
                        <button className={cx("option-item", "edit")} onClick={handleEditPost}>
                          <Edit3 size={16} />
                          <span>Chỉnh sửa bài viết</span>
                        </button>
                        <button className={cx("option-item", "delete")} onClick={handleDeletePost}>
                          <Trash2 size={16} />
                          <span>Xóa bài viết</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={cx("post-content")}>
              <p className={cx("post-text")}>{post.content}</p>

              {post.location && post.location.name && (
                <div className={cx("post-location")}>
                  <MapPin size={16} />
                  <span>{post.location.name}</span>
                </div>
              )}
            </div>

            <div className={cx("comments-section")}>
              <div className={cx("comments-header")}>
                <h3>Bình luận ({comments.length})</h3>
              </div>

              <div className={cx("comments-list")}>
                {loading ? (
                  <div className={cx("loading-comments")}>Đang tải bình luận...</div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => {
                    const commentUser = sampleUsers.find((user) => user._id === comment.user_id) || {
                      full_name: "Unknown User",
                      profile_picture: "/images/default-avatar.jpg",
                    }

                    return (
                      <div key={comment._id} className={cx("comment-item")}>
                        <img
                          src={commentUser.profile_picture || "/images/default-avatar.jpg"}
                          alt={commentUser.full_name}
                          className={cx("comment-avatar")}
                        />
                        <div className={cx("comment-content")}>
                          <div className={cx("comment-header")}>
                            <span className={cx("comment-author")}>{commentUser.full_name}</span>
                            <span className={cx("comment-time")}>{formatTimeAgo(comment.created_at)}</span>
                          </div>
                          <p className={cx("comment-text")}>{comment.content}</p>
                          <div className={cx("comment-actions")}>
                            <button className={cx("comment-like")}>Thích</button>
                            <button className={cx("comment-reply")}>Trả lời</button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className={cx("no-comments")}>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>
                )}
              </div>

              <div className={cx("post-interaction")}>
                <div className={cx("interaction-buttons")}>
                  <button className={cx("interaction-button", { active: liked })} onClick={handleLike}>
                    <Heart size={24} className={cx("interaction-icon")} fill={liked ? "currentColor" : "none"} />
                    <span>{likesCount}</span>
                  </button>
                  <button className={cx("interaction-button")} onClick={() => commentInputRef.current.focus()}>
                    <MessageCircle size={24} className={cx("interaction-icon")} />
                    <span>{comments.length}</span>
                  </button>
                  <button className={cx("interaction-button")}>
                    <Share2 size={24} className={cx("interaction-icon")} />
                  </button>
               
                </div>
              </div>

              <form className={cx("comment-form")} onSubmit={handleSubmitComment}>
                <input
                  type="text"
                  placeholder="Thêm bình luận..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className={cx("comment-input")}
                  ref={commentInputRef}
                />
                <button
                  type="submit"
                  className={cx("comment-submit", { active: newComment.trim().length > 0 })}
                  disabled={newComment.trim().length === 0}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetail
