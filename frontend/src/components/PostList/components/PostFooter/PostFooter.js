import { Heart, MessageCircle, Share2 } from "lucide-react"
import styles from "./PostFooter.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const PostFooter = ({ liked, likesCount, commentsCount, onLike }) => {
  return (
    <div className={cx("post-footer")}>
      <div className={cx("interaction-buttons")}>
        <button className={cx("interaction-button", { liked })} onClick={onLike}>
          <Heart className={cx("interaction-icon")} size={20} fill={liked ? "currentColor" : "none"} />
          <span className={cx("interaction-count")}>{likesCount}</span>
        </button>
        <button className={cx("interaction-button")}>
          <MessageCircle className={cx("interaction-icon")} size={20} />
          <span className={cx("interaction-count")}>{commentsCount}</span>
        </button>
        <button className={cx("interaction-button")}>
          <Share2 className={cx("interaction-icon")} size={20} />
        </button>
      </div>
    </div>
  )
}

export default PostFooter