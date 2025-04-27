"use client"

import { useState } from "react"
import { Play, Heart, MessageCircle } from "lucide-react"
import styles from "./PostGrid.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const PostGrid = ({ posts, emptyMessage, onPostClick }) => {
  const [hoveredPost, setHoveredPost] = useState(null)

  if (!posts || posts.length === 0) {
    return (
      <div className={cx("empty-state")}>
        <div className={cx("empty-icon")}>
          <svg width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 40.5C33.1127 40.5 40.5 33.1127 40.5 24C40.5 14.8873 33.1127 7.5 24 7.5C14.8873 7.5 7.5 14.8873 7.5 24C7.5 33.1127 14.8873 40.5 24 40.5ZM24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42Z"
              fill="currentColor"
            ></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18.5 24C19.3284 24 20 23.3284 20 22.5C20 21.6716 19.3284 21 18.5 21C17.6716 21 17 21.6716 17 22.5C17 23.3284 17.6716 24 18.5 24ZM29.5 24C30.3284 24 31 23.3284 31 22.5C31 21.6716 30.3284 21 29.5 21C28.6716 21 28 21.6716 28 22.5C28 23.3284 28.6716 24 29.5 24Z"
              fill="currentColor"
            ></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 29C26.2091 29 28 27.2091 28 25H26C26 26.1046 25.1046 27 24 27C22.8954 27 22 26.1046 22 25H20C20 27.2091 21.7909 29 24 29Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <p className={cx("empty-message")}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cx("post-grid")}>
      {posts.map((post) => (
        <div
          key={post._id}
          className={cx("post-item")}
          onMouseEnter={() => setHoveredPost(post._id)}
          onMouseLeave={() => setHoveredPost(null)}
          onClick={() => onPostClick(post)}
        >
          <div className={cx("post-thumbnail-container")}>
            {post.media && post.media.length > 0 && (
              <>
                {post.media[0].type === "image" ? (
                  <img
                    src={post.media[0].url || "/placeholder.svg?height=300&width=300"}
                    alt={post.content}
                    className={cx("post-thumbnail")}
                  />
                ) : (
                  <div className={cx("video-thumbnail")}>
                    <img
                      src={post.thumbnail_url || post.media[0].url || "/placeholder.svg?height=300&width=300"}
                      alt={post.content}
                      className={cx("post-thumbnail")}
                    />
                    <div className={cx("video-icon")}>
                      <Play size={20} fill="white" />
                    </div>
                  </div>
                )}
              </>
            )}

            {hoveredPost === post._id && (
              <div className={cx("post-overlay")}>
                <div className={cx("post-stats")}>
                  <div className={cx("stat")}>
                    <Heart size={18} />
                    <span>{post.likes_count.toLocaleString()}</span>
                  </div>
                  <div className={cx("stat")}>
                    <MessageCircle size={18} />
                    <span>{post.comments_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PostGrid
