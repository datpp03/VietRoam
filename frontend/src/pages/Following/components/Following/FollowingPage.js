"use client"

import { useState, useEffect } from "react"
import UserCard from "./UserCard"
import SuggestedUsers from "./SuggestedUsers"
import { sampleFollowingUsers, sampleSuggestedUsers, currentUser } from "./sampleData"
import styles from "./FollowingPage.module.scss"
import classNames from "classnames/bind"
import { Search, Users, UserPlus } from "lucide-react"

const cx = classNames.bind(styles)

const FollowingPage = () => {
  const [followingUsers, setFollowingUsers] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("following")

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // In a real app, you would fetch data from your API
        setTimeout(() => {
          setFollowingUsers(sampleFollowingUsers)
          setSuggestedUsers(sampleSuggestedUsers)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFollow = (userId) => {
    // Update suggested users
    setSuggestedUsers((prevUsers) =>
      prevUsers.map((user) => (user._id === userId ? { ...user, isFollowing: true } : user)),
    )

    // Move user from suggested to following
    const userToMove = suggestedUsers.find((user) => user._id === userId)
    if (userToMove) {
      setFollowingUsers((prevUsers) => [...prevUsers, { ...userToMove, isFollowing: true }])
    }
  }

  const handleUnfollow = (userId) => {
    // Update following users
    setFollowingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId))

    // Update suggested users if the user exists there
    setSuggestedUsers((prevUsers) =>
      prevUsers.map((user) => (user._id === userId ? { ...user, isFollowing: false } : user)),
    )
  }

  const filteredFollowingUsers = followingUsers.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className={cx("following-page")}>
      <div className={cx("following-header")}>
        <h1>Following</h1>
        <div className={cx("search-container")}>
          <Search className={cx("search-icon")} size={18} />
          <input
            type="text"
            placeholder="Search following accounts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cx("search-input")}
          />
        </div>
      </div>

      <div className={cx("tabs")}>
        <button className={cx("tab", { active: activeTab === "following" })} onClick={() => setActiveTab("following")}>
          <Users size={20} />
          <span>Following</span>
          <span className={cx("count")}>{followingUsers.length}</span>
        </button>
        <button className={cx("tab", { active: activeTab === "suggested" })} onClick={() => setActiveTab("suggested")}>
          <UserPlus size={20} />
          <span>Suggested</span>
        </button>
      </div>

      {loading ? (
        <div className={cx("loading")}>
          <div className={cx("spinner")}></div>
          <p>Loading users...</p>
        </div>
      ) : activeTab === "following" ? (
        <>
          {filteredFollowingUsers.length > 0 ? (
            <div className={cx("users-grid")}>
              {filteredFollowingUsers.map((user) => (
                <UserCard key={user._id} user={user} onUnfollow={handleUnfollow} currentUser={currentUser} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className={cx("empty-state")}>
              <Users size={48} />
              <h3>No results found</h3>
              <p>We couldn't find any users matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className={cx("empty-state")}>
              <Users size={48} />
              <h3>You're not following anyone yet</h3>
              <p>When you follow people, you'll see them here</p>
              <button className={cx("discover-button")} onClick={() => setActiveTab("suggested")}>
                Discover people
              </button>
            </div>
          )}
        </>
      ) : (
        <SuggestedUsers users={suggestedUsers} onFollow={handleFollow} currentUser={currentUser} />
      )}
    </div>
  )
}

export default FollowingPage
