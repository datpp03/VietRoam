import { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Post.module.scss";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostFooter from "./PostFooter";
import CommentSection from "./CommentSection";
import { useAuth } from "~/contexts/AuthContext";

const cx = classNames.bind(styles);

const Post = ({ post, user }) => {
  const { user: authUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const postRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setShowComments(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => {
      if (postRef.current) {
        observer.unobserve(postRef.current);
      }
    };
  }, []);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  if (!post) return null;

  const displayUser = authUser || user || {
    _id: "guest",
    full_name: "Guest",
    profile_picture: "https://via.placeholder.com/40",
  };

  const enhancedPost = {
    ...post,
    liked_by: post.liked_by || [],
  };

  return (
    <div className={cx("post-container", `status-${post.status}`)} ref={postRef}>
      <PostHeader post={post} user={user} authUser={authUser} />
      <PostContent post={post} />
      <PostFooter
        post={enhancedPost}
        user={displayUser}
        onToggleComments={toggleComments}
        commentsCount={post.comments_count}
      />
      <CommentSection
        post={enhancedPost}
        currentUser={displayUser}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
};

export default Post;