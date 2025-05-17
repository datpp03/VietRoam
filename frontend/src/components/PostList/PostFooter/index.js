import classNames from "classnames/bind";
import { MessageCircle, MapPin } from "lucide-react";
import styles from "./PostFooter.module.scss";
import LikeButton from "../LikeButton";

const cx = classNames.bind(styles);

const PostFooter = ({ post, user, onToggleComments, commentsCount }) => {
  const handleLikeChange = (isLiked, newCount) => {
    console.log(`Post ${post._id} liked: ${isLiked}, new count: ${newCount}`);
  };

  const handleLikeAnimation = () => {
    const heartAnimation = document.createElement("div");
    heartAnimation.className = cx("post-heart-animation");
    heartAnimation.innerHTML = `<svg class="${cx("heart-icon")}" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fe2c55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    document.body.appendChild(heartAnimation);
    setTimeout(() => heartAnimation.remove(), 1000);
  };

  // Tạo URL Google Maps từ tọa độ [longitude, latitude]
  const googleMapsUrl = post.location?.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${post.location.coordinates[1]},${post.location.coordinates[0]}`
    : "#";

  return (
    <div className={cx("post-footer")}>
      <div className={cx("interaction-buttons")}>
        <LikeButton
          post={post}
          user={user}
          onLikeChange={handleLikeChange}
          onLikeAnimation={handleLikeAnimation}
        />
        <button className={cx("interaction-button")} onClick={onToggleComments}>
          <MessageCircle className={cx("interaction-icon")} size={20} />
          <span className={cx("interaction-count")}>{commentsCount}</span>
        </button>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cx("interaction-button")}
          title="Open in Google Maps"
        >
          <MapPin className={cx("interaction-icon")} size={20} />
        </a>
      </div>
    </div>
  );
};

export default PostFooter;