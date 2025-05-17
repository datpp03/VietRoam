import { useState } from "react";
import { Heart, MessageCircle, UserPlus, Reply, Check } from "lucide-react";
import styles from "./NotificationItem.module.scss";
import classNames from "classnames/bind";
import { formatTimeAgo } from "~/utils/dateUtils";

const cx = classNames.bind(styles);

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMarkAsRead = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification._id);
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className={cx("notification-icon", "like")} size={20} />;
      case "comment":
        return <MessageCircle className={cx("notification-icon", "comment")} size={20} />;
      case "follow":
        return <UserPlus className={cx("notification-icon", "follow")} size={20} />;
      case "reply":
        return <Reply className={cx("notification-icon", "reply")} size={20} />;
      default:
        return <Heart className={cx("notification-icon")} size={20} />;
    }
  };

  const getNotificationText = () => {
    const username = notification.sender_id.full_name || notification.sender_id.email.split('@')[0];
    switch (notification.type) {
      case "like":
        return (
          <>
            <span className={cx("username")}>{username}</span> đã thích bài viết của bạn
          </>
        );
      case "comment":
        return (
          <>
            <span className={cx("username")}>{username}</span> đã bình luận về bài viết của bạn:{" "}
            <span className={cx("content-preview")}>
              "{notification.comment_id?.content.substring(0, 30) || ""}..."
            </span>
          </>
        );
      case "follow":
        return (
          <>
            <span className={cx("username")}>{username}</span> đã bắt đầu theo dõi bạn
          </>
        );
      case "reply":
        return (
          <>
            <span className={cx("username")}>{username}</span> đã trả lời bình luận của bạn:{" "}
            <span className={cx("content-preview")}>
              "{notification.comment_id?.content.substring(0, 30) || ""}..."
            </span>
          </>
        );
      default:
        return (
          <>
            <span className={cx("username")}>{username}</span> đã tương tác với bạn
          </>
        );
    }
  };

  const getNotificationMedia = () => {
    if (notification.post_id && notification.post_id.media && notification.post_id.media.length > 0) {
      const media = notification.post_id.media[0];
      if (media.type === "image") {
        return (
          <div className={cx("media-preview")}>
            <img src={media.url || "/placeholder.svg"} alt="Post media" />
          </div>
        );
      } else if (media.type === "video") {
        return (
          <div className={cx("media-preview", "video")}>
            <video src={media.url} />
            <div className={cx("video-overlay")}>
              <span>Video</span>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div
      className={cx("notification-item", { unread: !notification.is_read })}
      onClick={handleMarkAsRead}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cx("notification-content")}>
        <div className={cx("avatar-container")}>
          <img
            src={notification.sender_id.profile_picture || "/placeholder.svg?height=40&width=40"}
            alt={notification.sender_id.full_name || notification.sender_id.email}
            className={cx("avatar")}
          />
          <div className={cx("icon-container")}>{getNotificationIcon()}</div>
        </div>

        <div className={cx("notification-details")}>
          <p className={cx("notification-text")}>{getNotificationText()}</p>
          <span className={cx("notification-time")}>{formatTimeAgo(notification.createdAt)}</span>
        </div>

        {getNotificationMedia()}

        {!notification.is_read && isHovered && (
          <button
            className={cx("mark-read-button")}
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead();
            }}
          >
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;