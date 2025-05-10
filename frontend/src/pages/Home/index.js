import { useState, useEffect } from "react"
import PostList from "~/components/PostList"
import { useAuth } from "~/contexts/AuthContext"
import { getPosts,getPostsIsLogin } from "~/services/postService"
import { getUsersBatch } from "~/services/userService"

const Home = () => {
  const { user, token } = useAuth()
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        if (user && user.id) {
          const postData = await getPostsIsLogin(user.id)
          
          const fetchedPosts = postData.posts || []
          const userIds = [...new Set(fetchedPosts.map(post => post.user_id))]
          const userData = await getUsersBatch(userIds)
          setPosts(fetchedPosts)
          setUsers(userData.users || [])
        } else {
          const postData = await getPosts()
          const fetchedPosts = postData.posts || []
          const userIds = [...new Set(fetchedPosts.map(post => post.user_id))]
          const userData = await getUsersBatch(userIds)
          setPosts(fetchedPosts)
          setUsers(userData.users || [])
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
  }, [token])

  return (
    <>
      {loading ? <div className="loading">Loading posts...</div> : <PostList posts={posts} users={users} />}
    </>
  )
}

export default Home