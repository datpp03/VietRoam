import { useState, useEffect, useRef, forwardRef } from "react";
import styles from "./NotificationDropdown.module.scss";
import classNames from "classnames/bind";
import NotificationList from "./NotificationList";
import { useAuth } from "~/contexts/AuthContext";
import { useNotifications } from "~/contexts/NotificationContext";

const cx = classNames.bind(styles);

const NotificationDropdown = forwardRef(({ children }, ref) => {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Bọc hàm markAsRead để tự động truyền user.id
  const handleMarkAsRead = (notificationId) => {
    if (user?.id) {
      markAsRead(user.id, notificationId);
    } else {
      console.error("Không thể đánh dấu thông báo đã đọc: userId không tồn tại");
    }
  };

  // Bọc hàm markAllAsRead để tự động truyền user.id
  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead(user.id);
    } else {
      console.error("Không thể đánh dấu tất cả thông báo đã đọc: userId không tồn tại");
    }
  };

  return (
    <div className={cx("notification-dropdown-container")} ref={ref}>
      <div onClick={toggleDropdown}>{children}</div>

      {isOpen && user?.id && (
        <div className={cx("dropdown-content")}>
          {loading ? (
            <div className={cx("loading")}>Đang tải...</div>
          ) : error ? (
            <div className={cx("error")}>{error}</div>
          ) : (
            <NotificationList
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          )}
        </div>
      )}
    </div>
  );
});

export default NotificationDropdown;