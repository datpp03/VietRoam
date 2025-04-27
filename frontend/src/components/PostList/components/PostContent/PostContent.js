import { useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin } from "lucide-react"
import styles from "./PostContent.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const PostContent = ({ post }) => {
  const [showMap, setShowMap] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const mediaContainerRef = useRef(null)
  const totalItems = post?.media?.length || 0

  // Media handling functions
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

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null

    const getTransform = () => {
      const baseTransform = -currentIndex * 100
      const dragPercent = (dragOffset / (mediaContainerRef.current?.offsetWidth || 1)) * 100
      return `translateX(${baseTransform + dragPercent}%)`
    }

    return (
      <div className={cx("media-container")} ref={mediaContainerRef}>
        <div
          className={cx("media-swiper", { "is-dragging": isDragging })}
          onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleSwipeMove(e.touches[0].clientX)}
          onTouchEnd={handleSwipeEnd}
          onMouseDown={(e) => handleSwipeStart(e.clientX)}
          onMouseMove={(e) => handleSwipeMove(e.clientX)}
          onMouseUp={handleSwipeEnd}
          onMouseLeave={handleSwipeEnd}
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
                    alt={media.alt || "Post media"}
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
        <div className={cx("location-header")} onClick={() => setShowMap(!showMap)}>
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
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

  return (
    <div className={cx("post-content")}>
      <p className={cx("content-text")}>{post.content}</p>
      {renderTags()}
      {renderMedia()}
      {renderLocation()}
    </div>
  )
}

export default PostContent