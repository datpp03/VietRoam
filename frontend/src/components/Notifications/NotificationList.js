

import { useState } from "react"
import NotificationItem from "./NotificationItem"
import styles from "./NotificationList.module.scss"
import classNames from "classnames/bind"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faComment, faUserPlus, faAt, faBell } from "@fortawesome/free-solid-svg-icons"

const cx = classNames.bind(styles)

const NotificationList = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [activeFilter, setActiveFilter] = useState("all")

  const filterNotifications = () => {
    if (activeFilter === "all") {
      return notifications
    }
    return notifications.filter((notification) => notification.type === activeFilter)
  }

  const filteredNotifications = filterNotifications()

  return (
    <div className={cx("notification-list-container")}>
      <div className={cx("notification-filters")}>
        <button
          className={cx("filter-button", { active: activeFilter === "all" })}
          onClick={() => setActiveFilter("all")}
        >
          <FontAwesomeIcon icon={faBell} />
          <span>Tất cả</span>
        </button>
        <button
          className={cx("filter-button", { active: activeFilter === "like" })}
          onClick={() => setActiveFilter("like")}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>Thích</span>
        </button>
        <button
          className={cx("filter-button", { active: activeFilter === "comment" })}
          onClick={() => setActiveFilter("comment")}
        >
          <FontAwesomeIcon icon={faComment} />
          <span>Bình luận</span>
        </button>
        <button
          className={cx("filter-button", { active: activeFilter === "follow" })}
          onClick={() => setActiveFilter("follow")}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          <span>Theo dõi</span>
        </button>
      </div>

      <div className={cx("notification-header")}>
        <h3>Thông báo</h3>
        <button className={cx("mark-all-read")} onClick={onMarkAllAsRead}>
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className={cx("notifications-container")}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification._id} notification={notification} onMarkAsRead={onMarkAsRead} />
          ))
        ) : (
          <div className={cx("no-notifications")}>
            <FontAwesomeIcon icon={faBell} size="2x" />
            <p>Không có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationList
