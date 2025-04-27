"use client"

import { useState, useRef, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { MessageCircle, Share2, MapPin, Globe, Lock, Users, MoreHorizontal, Bookmark, Heart } from "lucide-react"
import L from "leaflet"
import styles from "./Post.module.scss"
import classNames from "classnames/bind"
import LikeButton from "./components/LikeButton"
import CommentSection from "./components/CommentSection"

// Fix for Leaflet marker icon issue
import iconShadow from "leaflet/dist/images/marker-shadow.png"

// Custom red marker
const DefaultIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

const cx = classNames.bind(styles)

const Post = ({ post, user }) => {
  const [saved, setSaved] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  const mediaContainerRef = useRef(null)
  const postRef = useRef(null)
  const totalItems = post?.media?.length || 0

  // Close comments when post is out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setShowComments(false)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (postRef.current) {
      observer.observe(postRef.current)
    }

    return () => {
      if (postRef.current) {
        observer.unobserve(postRef.current)
      }
    }
  }, [])

  const handleSave = () => {
    setSaved(!saved)
  }

  const toggleMap = () => {
    setShowMap(!showMap)
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  const handleLikeChange = (isLiked, newCount) => {
    console.log(`Post ${post._id} liked: ${isLiked}, new count: ${newCount}`)
  }

  const handleLikeAnimation = () => {
    setShowLikeAnimation(true)
    setTimeout(() => setShowLikeAnimation(false), 1000)
  }

  const renderVisibilityIcon = () => {
    switch (post.visibility) {
      case "private":
        return <Lock className={cx("visibility-icon")} size={16} />
      case "followers":
        return <Users className={cx("visibility-icon")} size={16} />
      case "public":
      default:
        return <Globe className={cx("visibility-icon")} size={16} />
    }
  }

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null

    const handleSwipeStart = (clientX) => {
      setIsDragging(true)
      setDragStartX(clientX)
      setDragOffset(0)
    }

    const handleSwipeMove = (clientX) => {
      if (!isDragging) return
      const diff = clientX - dragStartX
      if ((currentIndex === 0 && diff > 0) || (currentIndex === totalItems - 1 && diff < 0)) {
        setDragOffset(diff * 0.2)
      } else {
        setDragOffset(diff)
      }
    }

    const handleSwipeEnd = () => {
      if (!isDragging) return
      if (dragOffset < -50 && currentIndex < totalItems - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (dragOffset > 50 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
      setIsDragging(false)
      setDragOffset(0)
    }

    const handleTouchStart = (e) => {
      handleSwipeStart(e.touches[0].clientX)
    }

    const handleTouchMove = (e) => {
      handleSwipeMove(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
      handleSwipeEnd()
    }

    const handleMouseDown = (e) => {
      e.preventDefault()
      handleSwipeStart(e.clientX)
    }

    const handleMouseMove = (e) => {
      handleSwipeMove(e.clientX)
    }

    const handleMouseUp = () => {
      handleSwipeEnd()
    }

    const handleMouseLeave = () => {
      if (isDragging) {
        handleSwipeEnd()
      }
    }

    const getTransform = () => {
      const baseTransform = -currentIndex * 100
      const dragPercent = (dragOffset / (mediaContainerRef.current?.offsetWidth || 1)) * 100
      return `translateX(${baseTransform + dragPercent}%)`
    }

    return (
      <div className={cx("media-container")} ref={mediaContainerRef}>
        <div
          className={cx("media-swiper", { "is-dragging": isDragging })}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: getTransform(),
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          {post.media.map((media, index) => (
            <div key={index} className={cx("media-item")}>
              {media.type === "image" ? (
                <div className={cx("media-image-container")}>
                  <img
                    src={media.url || "/placeholder.svg"}
                    alt="Post media"
                    className={cx("media-image")}
                    draggable="false"
                  />
                </div>
              ) : (
                <div className={cx("media-video-container")}>
                  <video src={media.url} controls className={cx("media-video")}>
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          ))}
        </div>

        {showLikeAnimation && (
          <div className={cx("post-heart-animation")}>
            <Heart size={80} className={cx("heart-icon")} />
          </div>
        )}

        {totalItems > 1 && (
          <div className={cx("media-indicators")}>
            {post.media.map((_, index) => (
              <span
                key={index}
                className={cx("media-indicator", { active: index === currentIndex })}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderLocation = () => {
    if (!post.location || !post.location.coordinates) return null
    const position = [post.location.coordinates[1], post.location.coordinates[0]]

    return (
      <div className={cx("location-container")}>
        <div className={cx("location-header")} onClick={toggleMap}>
          <MapPin size={16} className={cx("location-icon")} />
          <span className={cx("location-name")}>{post.location.name || "Location"}</span>
        </div>

        {showMap && (
          <div className={cx("map-container")}>
            <MapContainer
              center={position}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%", borderRadius: "8px" }}
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  {post.location.name || "Location"}
                  <br />
                  {post.location.address || ""}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>
    )
  }

  const renderTags = () => {
    if (!post.tags || post.tags.length === 0) return null

    return (
      <div className={cx("tags-container")}>
        {post.tags.map((tag, index) => (
          <span key={index} className={cx("tag")}>
            #{tag}
          </span>
        ))}
      </div>
    )
  }

  if (!post) return null

  // Mock current user
  const currentUser = {
    _id: "user1",
    username: "nguyenvan",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  }

  // Enhance post with liked_by array if not present
  const enhancedPost = {
    ...post,
    liked_by: post.liked_by || [],
  }

  return (
    <div className={cx("post-container", `status-${post.status}`)} ref={postRef}>
      <div className={cx("post-header")}>
        <div className={cx("user-info")}>
          <img
            src={user?.avatar || "https://via.placeholder.com/40"}
            alt={user?.username || "User"}
            className={cx("avatar")}
          />
          <div className={cx("user-details")}>
            <div className={cx("username-container")}>
              <h4 className={cx("username")}>{user?.username || "Username"}</h4>
              {renderVisibilityIcon()}
            </div>
            <p className={cx("timestamp")}>{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className={cx("post-actions")}>
          <button className={cx("action-button")} onClick={handleSave}>
            <Bookmark className={cx("action-icon", { saved: saved })} size={20} />
          </button>
          <button className={cx("action-button")}>
            <MoreHorizontal className={cx("action-icon")} size={20} />
          </button>
        </div>
      </div>

      <div className={cx("post-content")}>
        <p className={cx("content-text")}>{post.content}</p>
        {renderTags()}
        {renderMedia()}
        {renderLocation()}
      </div>

      <div className={cx("post-footer")}>
        <div className={cx("interaction-buttons")}>
          <LikeButton
            post={enhancedPost}
            user={currentUser}
            onLikeChange={handleLikeChange}
            onLikeAnimation={handleLikeAnimation}
          />
          <button className={cx("interaction-button")} onClick={toggleComments}>
            <MessageCircle className={cx("interaction-icon")} size={20} />
            <span className={cx("interaction-count")}>{post.comments_count}</span>
          </button>
          <button className={cx("interaction-button")}>
            <Share2 className={cx("interaction-icon")} size={20} />
          </button>
        </div>
      </div>

      <CommentSection
        post={enhancedPost}
        currentUser={currentUser}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  )
}

export default Post