import { useState, useEffect } from "react"
import PostList from "~/components/PostList"
import { useAuth } from "~/contexts/AuthContext"
import { getPostsFollowing } from "~/services/postService"
import { getUsersBatch } from "~/services/userService"

const Following = () => {
  const { user, token } = useAuth()
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)

          if (user) {
            const postData = await getPostsFollowing(user?.id)
            const fetchedPosts = postData.posts || []
            if (fetchedPosts.length !== 0) {
              const userIds = [...new Set(fetchedPosts.map(post => post.user_id))]
              const userData = await getUsersBatch(userIds)
              setPosts(fetchedPosts)
              setUsers(userData.users || [])
            }
           
          }
      } catch (error) {
        console.error('Error fetching posts:', error)
        if (error.response) {
          console.error('API response:', error.response.data)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <>
      {loading ? <div className="loading">Loading posts...</div> : <PostList posts={posts} users={users} />}
    </>
  )
}

export default Following