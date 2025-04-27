import Post from "./Post"

const PostList = ({ posts, users }) => {
  return (
    <div className="post-list">
      {posts.map((post) => {
        const user = users.find((u) => u._id === post.user_id)
        return <Post key={post._id} post={post} user={user} />
      })}
    </div>
  )
}

export default PostList
