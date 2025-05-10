import { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import { Globe, Lock, Users, MoreHorizontal, Trash2 } from "lucide-react";
import { deletePost, updatePostStatus } from "~/services/postService";
import styles from "./PostHeader.module.scss";
import { useAuth } from "~/contexts/AuthContext";
import { Link } from "react-router-dom"
const cx = classNames.bind(styles);

const PostHeader = ({ post, user, authUser }) => {
  const { token } = useAuth();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef(null);
  const actionButtonRef = useRef(null);
  
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target) &&
        actionButtonRef.current &&
        !actionButtonRef.current.contains(event.target)
      ) {
        setShowActionMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const toggleActionMenu = (e) => {
    e.stopPropagation();
    setShowActionMenu((prev) => !prev);
  };

  const handleDeletePost = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await deletePost(post._id, token);
        window.location.reload();
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        alert("Không thể xóa bài viết");
      }
    }
  };

  const handleUpdateStatus = async (visibility) => {
    try {
      await updatePostStatus(post._id, post.status, visibility, token);
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái");
    }
  };

  const renderVisibilityIcon = () => {
    switch (post.visibility) {
      case "private":
        return <Lock className={cx("visibility-icon")} size={16} />;
      case "followers":
        return <Users className={cx("visibility-icon")} size={16} />;
      case "public":
      default:
        return <Globe className={cx("visibility-icon")} size={16} />;
    }
  };

  const renderActionMenu = () => {
    return (
      <div className={cx("action-menu")} ref={actionMenuRef}>
        <div
          className={cx("action-menu-item")}
          onClick={() => handleUpdateStatus("public")}
        >
          <Globe className={cx("action-menu-item-icon")} size={16} />
          Công khai
        </div>
        <div
          className={cx("action-menu-item")}
          onClick={() => handleUpdateStatus("followers")}
        >
          <Users className={cx("action-menu-item-icon")} size={16} />
          Người theo dõi
        </div>
        <div
          className={cx("action-menu-item")}
          onClick={() => handleUpdateStatus("private")}
        >
          <Lock className={cx("action-menu-item-icon")} size={16} />
          Riêng tư
        </div>
        <div className={cx("action-menu-item", "danger")} onClick={handleDeletePost}>
          <Trash2 className={cx("action-menu-item-icon")} size={16} />
          Xóa bài viết
        </div>
      </div>
    );
  };

  return (
    <div className={cx("post-header")}>
      <div className={cx("user-info")}>
        <Link to={`/@${user?.email.split('@')[0]}`} className={cx("user-link")}>
        <img
          src={user?.profile_picture || "https://via.placeholder.com/40"}
          alt={user?.full_name || "User"}
          className={cx("avatar")}
        />
        </Link>
        <div className={cx("user-details")}>
          <div className={cx("username-container")}>
            <Link to={`/@${user?.email.split('@')[0]}`} className={cx("user-link")}>
            <h4 className={cx("username")}>{user?.full_name || "Username"}</h4>
            </Link>
            {renderVisibilityIcon()}
          </div>
          <p className={cx("timestamp")}>{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      {authUser && authUser.id === post.user_id._id && (
        <div className={cx("post-actions")}>
          <button
            className={cx("action-button")}
            onClick={toggleActionMenu}
            ref={actionButtonRef}
          >
            <MoreHorizontal className={cx("action-icon")} size={20} />
          </button>
          {showActionMenu && renderActionMenu()}
        </div>
      )}
    </div>
  );
};

export default PostHeader;