"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
import styles from "./NotificationDropdown.module.scss"
import classNames from "classnames/bind"
import NotificationList from "./NotificationList"
import { sampleNotifications } from "./sampleNotifications"

const cx = classNames.bind(styles)

const NotificationDropdown = forwardRef(({ children }, ref) => {  // <- sửa ở đây
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Simulate fetching notifications
    setNotifications(sampleNotifications)
  }, [])

  // const unreadCount = notifications.filter((notification) => !notification.is_read).length

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification._id === notificationId ? { ...notification, is_read: true } : notification,
      ),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, is_read: true })),
    )
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
    <div className={cx("notification-dropdown-container")} ref={ref}>
      <div onClick={toggleDropdown}>{children}</div>

      {isOpen && (
        <div className={cx("dropdown-content")}>
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>
      )}
    </div>
  )
})

export default NotificationDropdown
