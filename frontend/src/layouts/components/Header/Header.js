/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faCoins,
  faEarthAsia,
  faEllipsisVertical,
  faGear,
  faKeyboard,
  faSignOut,
  faUser,
  faShield,
} from "@fortawesome/free-solid-svg-icons";

import { Link, useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import config from "~/config";
import Button from "~/components/Button";
import styles from "./Header.module.scss";
import images from "~/assets/images";
import Menu from "~/components/Popper/Menu";
import { InboxIcon, MessageIcon, UploadIcon } from "~/components/Icons";
import Image from "~/components/Image";
import Search from "../Search";
import { useAuth } from "~/contexts/AuthContext";
import NotificationDropdown from "~/components/Notifications/NotificationDropdown";
import { useNotifications } from '~/contexts/NotificationContext';
const cx = classNames.bind(styles);

const MENU_ITEMS = [
  {
    icon: <FontAwesomeIcon icon={faEarthAsia} />,
    title: "English",
    children: {
      title: "Language",
      data: [
        { type: "language", code: "vi", title: "Tiếng Việt" },
        { type: "language", code: "en", title: "developing" },
      ],
    },
  },
  {
    icon: <FontAwesomeIcon icon={faCircleQuestion} />,
    title: "developing",
    // title: "Feedback and help",
    // to: "/feedback",
  },
  {
    icon: <FontAwesomeIcon icon={faKeyboard} />,
    title: "developing",
    // title: "Keyboard shortcuts",
  },
];
const ADMIN_ITEMS = [
  {
    icon: <FontAwesomeIcon icon={faShield} />,
    title: "Admin",
    to: "/admin",

  },
];
function Header() {
  const { user, logout, loading } = useAuth();
  const { unreadCount, fetchNotifications } = useNotifications();
  const myId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (myId) {
      fetchNotifications(myId);
    }
  }, [myId]);

  if (loading) return null;

  const currentUser = !!user;
  const username = user?.email.split('@')[0];

  const handleMenuChange = (menuItem) => {
    switch (menuItem.type) {
      case "language":
        console.log("đang phát triển");
        break;
      case "logout": 
        logout();
        navigate(config.routes.home);
        break;
      default:
    }
  };

  const menuItems = currentUser
    ? [
        {
          icon: <FontAwesomeIcon icon={faUser} />,
          title: "View profile",
          to: `/@${username}`,
        },
        {
          icon: <FontAwesomeIcon icon={faCoins} />,
          title: "developing",
          // title: "Get coins",
          // to: "/coin",
        },
        {
          icon: <FontAwesomeIcon icon={faGear} />,
          title: "developing",
          // title: "Settings",
          // to: "/settings",
        },
        ...MENU_ITEMS,
        {
          icon: <FontAwesomeIcon icon={faSignOut} />,
          title: "Log out",
          type: "logout",
          separate: true,
        },
        ...(user && !user?.role ? ADMIN_ITEMS : []),
      ]
    : MENU_ITEMS;

  return (
    <header className={cx("wrapper")}>
      <div className={cx("inner")}>
        <Link to={config.routes.home} className={cx("logo-link")}>
          <img src={images.logo || "/placeholder.svg"} alt="travelblog" className={cx("logo")} />
        </Link>

        <Search />
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
                    {unreadCount > 0 && <span className={cx("badge")}>{unreadCount}</span>}
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
  );
}

export default Header;