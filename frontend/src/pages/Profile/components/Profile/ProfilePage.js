"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  UserCheck,
  UserPlus,
  UserMinus,
  CheckCircle,
  MapPin,
  Share2,
  MoreHorizontal,
  Grid,
  Heart,
  Edit,
  Settings,
} from "lucide-react"
import styles from "./ProfilePage.module.scss"
import classNames from "classnames/bind"
import PostGrid from "./PostGrid"
import PostDetail from "./PostDetail"
import EditProfileModal from "./EditProfileModal"
import { sampleUsers, samplePosts } from "./sampleData"

const cx = classNames.bind(styles)

const ProfilePage = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [loading, setLoading] = useState(true)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // In a real app, you would fetch data from your API
        setTimeout(() => {
          // Find user by ID from sample data
          const foundUser = sampleUsers.find((u) => u._id === userId) || sampleUsers[0]
          setUser(foundUser)

          // Filter posts by user ID
          // In a real app, this would be fetched from the virtual 'posts' field
          const userPosts = samplePosts.filter((post) => post.user_id === foundUser._id)
          setPosts(userPosts)

          // Get liked posts (in a real app, this would be from API)
          const liked = samplePosts.filter((post) => post.liked_by?.includes(foundUser._id))
          setLikedPosts(liked)

          // Check if following
          setIsFollowing(foundUser.isFollowing || false)

          // Check if current user (for edit profile button)
          // In a real app, you would compare with the logged-in user ID
          setIsCurrentUser(foundUser._id === "user123")

          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing)

    // In a real app, you would make an API call to follow/unfollow
    if (user) {
      if (isFollowing) {
        // Unfollow
        setUser((prev) => ({
          ...prev,
          followers_count: prev.followers_count - 1,
        }))
      } else {
        // Follow
        setUser((prev) => ({
          ...prev,
          followers_count: prev.followers_count + 1,
        }))
      }
    }
  }

  const handlePostClick = (post) => {
    setSelectedPost(post)
  }

  const handleClosePostDetail = () => {
    setSelectedPost(null)
  }

  const handleNextPost = () => {
    if (!selectedPost) return

    const currentPosts = activeTab === "posts" ? posts : likedPosts
    const currentIndex = currentPosts.findIndex((post) => post._id === selectedPost._id)

    if (currentIndex < currentPosts.length - 1) {
      setSelectedPost(currentPosts[currentIndex + 1])
    }
  }

  const handlePrevPost = () => {
    if (!selectedPost) return

    const currentPosts = activeTab === "posts" ? posts : likedPosts
    const currentIndex = currentPosts.findIndex((post) => post._id === selectedPost._id)

    if (currentIndex > 0) {
      setSelectedPost(currentPosts[currentIndex - 1])
    }
  }

  const handleOpenEditProfile = () => {
    setShowEditProfile(true)
  }

  const handleCloseEditProfile = () => {
    setShowEditProfile(false)
  }

  const handleSaveProfile = (updatedProfile) => {
    // In a real app, you would make an API call to update the profile
    setUser({
      ...user,
      ...updatedProfile,
    })
    setShowEditProfile(false)
  }

  const getActiveTabContent = () => {
    switch (activeTab) {
      case "posts":
        return <PostGrid posts={posts} emptyMessage="Chưa có bài viết nào" onPostClick={handlePostClick} />
      case "liked":
        return <PostGrid posts={likedPosts} emptyMessage="Chưa có bài viết đã thích" onPostClick={handlePostClick} />
      default:
        return <PostGrid posts={posts} emptyMessage="Chưa có bài viết nào" onPostClick={handlePostClick} />
    }
  }

  if (loading) {
    return (
      <div className={cx("loading")}>
        <div className={cx("spinner")}></div>
        <p>Đang tải hồ sơ...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={cx("error-state")}>
        <h2>Không tìm thấy người dùng</h2>
        <p>Người dùng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      </div>
    )
  }

  return (
    <div className={cx("profile-page")}>
      <div className={cx("profile-header")}>
        <div className={cx("profile-info")}>
          <div className={cx("profile-avatar-container")}>
            <img
              src={user.profile_picture || "/images/default-avatar.jpg"}
              alt={user.full_name}
              className={cx("profile-avatar")}
            />
          </div>

          <div className={cx("profile-details")}>
            <div className={cx("profile-name-container")}>
              <h1 className={cx("profile-name")}>
                {user.full_name}
                {user.is_verified && <CheckCircle className={cx("verified-icon")} size={20} />}
              </h1>

              <div className={cx("profile-actions")}>
                {isCurrentUser ? (
                  <>
                    <button className={cx("edit-profile-button")} onClick={handleOpenEditProfile}>
                      <Edit size={16} />
                      <span>Chỉnh sửa hồ sơ</span>
                    </button>
                    <button className={cx("settings-button")}>
                      <Settings size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={cx("follow-button", { following: isFollowing })}
                      onClick={handleFollowToggle}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      {isFollowing ? (
                        isHovered ? (
                          <>
                            <UserMinus size={18} />
                            <span>Bỏ theo dõi</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={18} />
                            <span>Đang theo dõi</span>
                          </>
                        )
                      ) : (
                        <>
                          <UserPlus size={18} />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>
                    <button className={cx("share-button")}>
                      <Share2 size={20} />
                    </button>
                    <button className={cx("more-button")}>
                      <MoreHorizontal size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className={cx("profile-stats")}>
              <div className={cx("stat-item")}>
                <span className={cx("stat-value")}>{user.followers_count.toLocaleString()}</span>
                <span className={cx("stat-label")}>Người theo dõi</span>
              </div>
              <div className={cx("stat-item")}>
                <span className={cx("stat-value")}>{user.following_count.toLocaleString()}</span>
                <span className={cx("stat-label")}>Đang theo dõi</span>
              </div>
              <div className={cx("stat-item")}>
                <span className={cx("stat-value")}>{posts.length.toLocaleString()}</span>
                <span className={cx("stat-label")}>Bài viết</span>
              </div>
            </div>

            <p className={cx("profile-bio")}>{user.bio}</p>

            {user.location && (user.location.city || user.location.country) && (
              <div className={cx("profile-location")}>
                <MapPin size={16} />
                <span>{[user.location.city, user.location.country].filter(Boolean).join(", ")}</span>
              </div>
            )}

            {user.travel_interests && user.travel_interests.length > 0 && (
              <div className={cx("profile-interests")}>
                {user.travel_interests.map((interest, index) => (
                  <span key={index} className={cx("interest-tag")}>
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cx("profile-content")}>
        <div className={cx("content-tabs")}>
          <button className={cx("tab-button", { active: activeTab === "posts" })} onClick={() => setActiveTab("posts")}>
            <Grid size={20} />
            <span>Bài viết</span>
          </button>
          <button className={cx("tab-button", { active: activeTab === "liked" })} onClick={() => setActiveTab("liked")}>
            <Heart size={20} />
            <span>Đã thích</span>
          </button>
        </div>

        <div className={cx("tab-content")}>{getActiveTabContent()}</div>
      </div>

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={handleClosePostDetail}
          onNext={handleNextPost}
          onPrev={handlePrevPost}
          hasNext={
            activeTab === "posts"
              ? posts.findIndex((post) => post._id === selectedPost._id) < posts.length - 1
              : likedPosts.findIndex((post) => post._id === selectedPost._id) < likedPosts.length - 1
          }
          hasPrev={
            activeTab === "posts"
              ? posts.findIndex((post) => post._id === selectedPost._id) > 0
              : likedPosts.findIndex((post) => post._id === selectedPost._id) > 0
          }
          currentUser={isCurrentUser}
        />
      )}

      {showEditProfile && <EditProfileModal user={user} onClose={handleCloseEditProfile} onSave={handleSaveProfile} />}
    </div>
  )
}

export default ProfilePage
