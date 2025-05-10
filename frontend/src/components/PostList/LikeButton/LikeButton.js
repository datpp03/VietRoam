import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import classNames from "classnames/bind"
import styles from "./LikeButton.module.scss"
import { useAuth } from "~/contexts/AuthContext"
import { toggleLike } from "~/services/postService"

const cx = classNames.bind(styles)

const LikeButton = ({ post, user, onLikeChange, onLikeAnimation }) => {
  const { user: authUser, token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [showTapHeart, setShowTapHeart] = useState(false)
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const isLiked = post?.liked_by?.includes(authUser?.id) || false
    setLiked(isLiked)
    setLikesCount(post?.likes_count || 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?._id, authUser])

  const handleLikeToggle = async (e) => {
    e.preventDefault()
    if (isLoading || !authUser || !token || !post?._id) {
      console.error('Cannot toggle like: invalid data', { postId: post?._id, userId: authUser?.id })
      return
    }

    setIsLoading(true)

    try {
      const data = await toggleLike(post._id, authUser.id, token, liked)
      console.log('toggleLike response:', data)
      setLiked(data.liked)
      setLikesCount(data.likes_count)
      if (onLikeChange) {
        onLikeChange(data.liked, data.likes_count)
      }
      if (data.liked && onLikeAnimation) {
        onLikeAnimation()
      }
    } catch (error) {
      console.error('Failed to toggle like:', error.response?.data || error.message)
      alert('Failed to toggle like. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDoubleTap = (e) => {
    if (!authUser || !token) return

    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTapTime

    if (tapLength < 300 && tapLength > 0 && !liked) {
      setTapPosition({
        x: e.clientX || e.touches[0].clientX,
        y: e.clientY || e.touches[0].clientY,
      })
      setShowTapHeart(true)
      setTimeout(() => setShowTapHeart(false), 1000)
      handleLikeToggle(e)
    }
    setLastTapTime(currentTime)
  }

  return (
    <div className={cx("like-container")}>
      <button
        className={cx("like-button", { liked })}
        onClick={handleLikeToggle}
        disabled={isLoading || !authUser}
        aria-label={liked ? "Unlike" : "Like"}
        style={{ opacity: !authUser ? 0.5 : 1, cursor: !authUser ? 'not-allowed' : 'pointer' }}
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