"use client"

import { useState } from "react"

import classNames from "classnames/bind"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCircleQuestion,
  faCoins,
  faEarthAsia,
  faEllipsisVertical,
  faGear,
  faKeyboard,
  faSignOut,
  faUser,
} from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"

import config from "~/config"
import Button from "~/components/Button"
import styles from "./Header.module.scss"
import images from "~/assets/images"
import Menu from "~/components/Popper/Menu"
import { InboxIcon, MessageIcon, UploadIcon } from "~/components/Icons"
import Image from "~/components/Image"
import Search from "../Search"
import { useAuth } from "~/context/AuthContext"
import NotificationDropdown from "~/components/Notifications/NotificationDropdown"
import { sampleNotifications } from "~/components/Notifications/sampleNotifications"

const cx = classNames.bind(styles)

const MENU_ITEMS = [
  {
    icon: <FontAwesomeIcon icon={faEarthAsia} />,
    title: "English",
    children: {
      title: "Language",
      data: [
        { type: "language", code: "en", title: "English" },
        { type: "language", code: "vi", title: "Tiếng Việt" },
      ],
    },
  },
  {
    icon: <FontAwesomeIcon icon={faCircleQuestion} />,
    title: "Feedback and help",
    to: "/feedback",
  },
  {
    icon: <FontAwesomeIcon icon={faKeyboard} />,
    title: "Keyboard shortcuts",
  },
]

function Header() {
  const { user, logout, loading } = useAuth()
  const [notifications, setNotifications] = useState(sampleNotifications)

  if (loading) return null

  const currentUser = !!user

  const unreadCount = notifications.filter((notification) => !notification.is_read).length

  const handleMenuChange = (menuItem) => {
    switch (menuItem.type) {
      case "language":
        // Handle change language
        break
      case "logout":
        logout()
        break
      default:
    }
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

  const menuItems = currentUser
    ? [
        {
          icon: <FontAwesomeIcon icon={faUser} />,
          title: "View profile",
          to: `/@${user?.username || "me"}`,
        },
        {
          icon: <FontAwesomeIcon icon={faCoins} />,
          title: "Get coins",
          to: "/coin",
        },
        {
          icon: <FontAwesomeIcon icon={faGear} />,
          title: "Settings",
          to: "/settings",
        },
        ...MENU_ITEMS,
        {
          icon: <FontAwesomeIcon icon={faSignOut} />,
          title: "Log out",
          type: "logout",
          separate: true,
        },
      ]
    : MENU_ITEMS

  return (
    <header className={cx("wrapper")}>
      <div className={cx("inner")}>
        <Link to={config.routes.home} className={cx("logo-link")}>
          <img src={images.logo || "/placeholder.svg"} alt="travelblog" className={cx("logo")} />
        </Link>

       
        {currentUser && <Search />}
        <div className={cx("actions")}>
          {currentUser ? (
            <>
              <Tippy delay={[0, 50]} content="Upload video" placement="bottom">
                <Link to={config.routes.upload}>
                  <button className={cx("action-btn")}>
                    <UploadIcon />
                  </button>
                </Link>
              </Tippy>
              <Tippy delay={[0, 50]} content="Message" placement="bottom">
                <Link to={config.routes.messages}>
                  <button className={cx("action-btn")}>
                    <MessageIcon />
                  </button>
                </Link>
              </Tippy>
              <Tippy delay={[0, 50]} content="Inbox" placement="bottom">
                <NotificationDropdown>
                  <button className={cx("action-btn")}>
                    <InboxIcon />
                    <span className={cx("badge")}>{unreadCount}</span>
                  </button>
                </NotificationDropdown>
              </Tippy>
            </>
          ) : (
            <>
              <Button text>Upload</Button>
              <Link to={config.routes.login}>
                <Button primary>Log in</Button>
              </Link>
            </>
          )}

          <Menu key={currentUser ? "logged-in" : "logged-out"} items={menuItems} onChange={handleMenuChange}>
            {currentUser ? (
              <Image
                className={cx("user-avatar")}
                src={user?.avatar || "https://files.fullstack.edu.vn/f8-prod/user_avatars/1/623d4b2d95cec.png"}
                alt={user?.username || "User"}
              />
            ) : (
              <button className={cx("more-btn")}>
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
            )}
          </Menu>
        </div>
      </div>
    </header>
  )
}

export default Header
