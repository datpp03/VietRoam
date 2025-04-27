"use client"

import UserCard from "./UserCard"
import styles from "./SuggestedUsers.module.scss"
import classNames from "classnames/bind"
import { UserPlus } from "lucide-react"

const cx = classNames.bind(styles)

const SuggestedUsers = ({ users, onFollow, currentUser }) => {
  return (
    <div className={cx("suggested-users")}>
      <div className={cx("section-header")}>
        <h2>Suggested accounts</h2>
        <p>Users you might want to follow based on your interests</p>
      </div>

      {users.length > 0 ? (
        <div className={cx("users-grid")}>
          {users.map((user) => (
            <UserCard key={user._id} user={user} onFollow={onFollow} currentUser={currentUser} />
          ))}
        </div>
      ) : (
        <div className={cx("empty-state")}>
          <UserPlus size={48} />
          <h3>No suggested users</h3>
          <p>We'll suggest users based on your activity</p>
        </div>
      )}
    </div>
  )
}

export default SuggestedUsers
