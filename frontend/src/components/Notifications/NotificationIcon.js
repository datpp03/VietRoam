

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import styles from "./NotificationIcon.module.scss"
import classNames from "classnames/bind"
import NotificationList from "./NotificationList"

const cx = classNames.bind(styles)

const NotificationIcon = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter((notification) => !notification.is_read).length

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={cx("notification-icon-container")} ref={dropdownRef}>
      <button className={cx("notification-button")} onClick={toggleDropdown}>
        <Bell size={24} />
        {unreadCount > 0 && <span className={cx("notification-badge")}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={cx("notification-dropdown")}>
          <NotificationList
            notifications={notifications}
            onMarkAsRead={(id) => {
              onMarkAsRead(id)
            }}
            onMarkAllAsRead={onMarkAllAsRead}
          />
        </div>
      )}
    </div>
  )
}

export default NotificationIcon
