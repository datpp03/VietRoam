"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { UserCheck, UserMinus, UserPlus, CheckCircle } from "lucide-react"
import styles from "./UserCard.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const UserCard = ({ user, onFollow, onUnfollow, currentUser }) => {
  const [isHovered, setIsHovered] = useState(false)
  const isFollowing = user.isFollowing

  const handleFollowToggle = () => {
    if (isFollowing) {
      onUnfollow(user._id)
    } else {
      onFollow(user._id)
    }
  }

  // Format interests to show only 2 with a "+X more" if there are more
  const formatInterests = (interests) => {
    if (!interests || interests.length === 0) return ""

    if (interests.length <= 2) {
      return interests.join(", ")
    }

    return `${interests[0]}, ${interests[1]} +${interests.length - 2} more`
  }

  return (
    <div className={cx("user-card")}>
      <div className={cx("user-header")}>
        <Link to={`/profile/${user._id}`} className={cx("user-avatar-link")}>
          <img
            src={user.profile_picture || "/placeholder.svg?height=100&width=100"}
            alt={user.full_name}
            className={cx("user-avatar")}
          />
        </Link>
        <div className={cx("user-info")}>
          <div className={cx("user-name-container")}>
            <Link to={`/profile/${user._id}`} className={cx("user-name")}>
              {user.full_name}
            </Link>
            {user.is_verified && <CheckCircle className={cx("verified-icon")} size={16} />}
          </div>
          <div className={cx("user-stats")}>
            <span>{user.followers_count.toLocaleString()} followers</span>
            <span className={cx("dot")}>•</span>
            <span>{user.following_count.toLocaleString()} following</span>
          </div>
        </div>
        <button
          className={cx("follow-button", { following: isFollowing })}
          onClick={handleFollowToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isFollowing ? (
            isHovered ? (
              <>
                <UserMinus size={16} />
                <span>Unfollow</span>
              </>
            ) : (
              <>
                <UserCheck size={16} />
                <span>Following</span>
              </>
            )
          ) : (
            <>
              <UserPlus size={16} />
              <span>Follow</span>
            </>
          )}
        </button>
      </div>

      <div className={cx("user-content")}>
        <p className={cx("user-bio")}>{user.bio || "No bio yet"}</p>

        {user.travel_interests && user.travel_interests.length > 0 && (
          <div className={cx("user-interests")}>
            <span className={cx("interests-label")}>Interests:</span>
            <span className={cx("interests-value")}>{formatInterests(user.travel_interests)}</span>
          </div>
        )}

        {user.location && (user.location.city || user.location.country) && (
          <div className={cx("user-location")}>
            <span className={cx("location-label")}>Location:</span>
            <span className={cx("location-value")}>
              {[user.location.city, user.location.country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCard
