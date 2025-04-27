

import { useState, useEffect } from "react"
import PostList from "~/components/PostList"

// Sample data for demonstration
const samplePosts = [
  {
    _id: "1",
    user_id: "user1",
    content:
      "Đang check-in tại một địa điểm tuyệt vời ở Hà Nội! Không khí trong lành và cảnh quan tuyệt đẹp. Mọi người nên ghé thăm khi có dịp. #hanoi #travel #vietnam",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
        description: "Hồ Hoàn Kiếm buổi sáng",
      },
    ],
    location: {
      type: "Point",
      coordinates: [105.8544, 21.0285],
      name: "Hồ Hoàn Kiếm",
      address: "Hàng Trống, Hoàn Kiếm, Hà Nội",
    },
    tags: ["hanoi", "travel", "vietnam"],
    status: "published",
    visibility: "public",
    likes_count: 42,
    comments_count: 7,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    user_id: "user2",
    content:
      "Hôm nay mình đã thử quán cà phê mới mở ở quận 1. Không gian rất đẹp và yên tĩnh, rất phù hợp để làm việc hoặc đọc sách. Cà phê ở đây cũng rất ngon! Mọi người nên ghé thử.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop",
        description: "Quán cà phê mới",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1000&auto=format&fit=crop",
        description: "Cà phê sữa đá",
      },
    ],
    location: {
      type: "Point",
      coordinates: [106.6297, 10.8231],
      name: "The Coffee House",
      address: "Quận 1, TP. Hồ Chí Minh",
    },
    tags: ["coffee", "saigon", "cafe"],
    status: "published",
    visibility: "followers",
    likes_count: 28,
    comments_count: 5,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    _id: "3",
    user_id: "user1",
    content:
      "Đang làm việc trên một dự án mới về ứng dụng bản đồ. Rất thú vị khi được khám phá các API địa lý và tích hợp chúng vào ứng dụng web. Hy vọng sẽ sớm hoàn thành và chia sẻ với mọi người!",
    media: [
      {
        type: "video",
        url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
        description: "Demo ứng dụng bản đồ",
      },
    ],
    location: {
      type: "Point",
      coordinates: [105.8012, 21.0245],
      name: "Toong Coworking Space",
      address: "Tràng Thi, Hoàn Kiếm, Hà Nội",
    },
    tags: ["coding", "maps", "webdev"],
    status: "draft",
    visibility: "private",
    likes_count: 0,
    comments_count: 0,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
]

const sampleUsers = [
  {
    _id: "user1",
    username: "nguyenvan",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    _id: "user2",
    username: "tranthiB",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
]

const Home = () => {
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setPosts(samplePosts)
      setUsers(sampleUsers)
      setLoading(false)
    }, 1000)
  }, [])

  return (
      <>
        {loading ? <div className="loading">Loading posts...</div> : <PostList posts={posts} users={users} />}
      </>
  )
}

export default Home
