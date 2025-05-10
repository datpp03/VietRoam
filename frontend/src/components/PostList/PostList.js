
import Post from "./Post"
import styles from "./PostList.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const PostList = ({ posts, users }) => {
  if (!posts || posts.length === 0) {
    return <div className={cx("no-posts")}>No posts available</div>
  }
  const userMap = users.reduce((map, user) => {
    map[user._id] = user
    return map
  }, {})

  return (
    <div className={cx("post-list")}>
      {posts.map((post) => {
        const user = userMap[post.user_id._id] || {
          _id: "unknown",
          full_name: "Unknown User",
          profile_picture: "https://via.placeholder.com/40",
        }

        return <Post key={post._id} post={post} user={user} />
      })}
    </div>
  )
}

export default PostList