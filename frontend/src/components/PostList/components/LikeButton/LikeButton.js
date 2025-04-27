"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import classNames from "classnames/bind"
import styles from "./LikeButton.module.scss"

const cx = classNames.bind(styles)

const LikeButton = ({ post, user, onLikeChange, onLikeAnimation }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [showTapHeart, setShowTapHeart] = useState(false)
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const isLiked = post?.liked_by?.includes(user?._id) || false
    setLiked(isLiked)
    setLikesCount(post?.likes_count || 0)
  }, [post, user])

  const handleLikeToggle = async () => {
    if (isLoading) return
    
    const newLikedState = !liked
    const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1
    
    // Optimistic update
    setIsLoading(true)
    setLiked(newLikedState)
    setLikesCount(newLikesCount)
    
    if (newLikedState && onLikeAnimation) {
      onLikeAnimation()
    }

    try {
      // Giả lập API call - thay bằng API thực tế của bạn
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: newLikedState ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()
      // Cập nhật từ server response
      setLiked(data.liked)
      setLikesCount(data.likes_count)
      
      if (onLikeChange) {
        onLikeChange(data.liked, data.likes_count)
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
      // Rollback nếu có lỗi
      setLiked(!newLikedState)
      setLikesCount(likesCount)
      if (onLikeChange) {
        onLikeChange(!newLikedState, likesCount)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDoubleTap = (e) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTapTime

    if (tapLength < 300 && tapLength > 0 && !liked) {
      setTapPosition({
        x: e.clientX || e.touches[0].clientX,
        y: e.clientY || e.touches[0].clientY
      })
      setShowTapHeart(true)
      setTimeout(() => setShowTapHeart(false), 1000)
      handleLikeToggle()
    }
    setLastTapTime(currentTime)
  }

  return (
    <div className={cx("like-container")}>
      <button
        className={cx("like-button", { liked })}
        onClick={handleLikeToggle}
        disabled={isLoading}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Heart 
          className={cx("like-icon", { liked })} 
          size={24} 
          fill={liked ? "currentColor" : "none"} 
        />
        <span className={cx("like-count")}>{likesCount}</span>
      </button>

      <div 
        className={cx("double-tap-area")}
        onTouchStart={handleDoubleTap}
        onClick={handleDoubleTap}
      />

      {showTapHeart && (
        <div 
          className={cx("tap-heart")}
          style={{
            left: `${tapPosition.x}px`,
            top: `${tapPosition.y}px`,
          }}
        />
      )}
    </div>
  )
}

export default LikeButton