import { Globe, Lock, Users, Bookmark, MoreHorizontal } from "lucide-react"
import styles from "./PostHeader.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const PostHeader = ({ user, post, saved, onSave }) => {
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

  return (
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
        <button className={cx("action-button")} onClick={onSave}>
          <Bookmark className={cx("action-icon", { saved })} size={20} />
        </button>
        <button className={cx("action-button")}>
          <MoreHorizontal className={cx("action-icon")} size={20} />
        </button>
      </div>
    </div>
  )
}

export default PostHeader