// Sample data for notifications
export const sampleNotifications = [
  {
    _id: "notif1",
    recipient_id: "user1",
    sender_id: "user2",
    type: "like",
    post_id: "post1",
    is_read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    sender: {
      _id: "user2",
      username: "tranthiB",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    post: {
      _id: "post1",
      content: "Đang check-in tại một địa điểm tuyệt vời ở Hà Nội!",
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
        },
      ],
    },
  },
  {
    _id: "notif2",
    recipient_id: "user1",
    sender_id: "user3",
    type: "comment",
    post_id: "post1",
    comment_id: "comment1",
    is_read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    sender: {
      _id: "user3",
      username: "nguyenthao",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    post: {
      _id: "post1",
      content: "Đang check-in tại một địa điểm tuyệt vời ở Hà Nội!",
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
        },
      ],
    },
    comment: {
      _id: "comment1",
      content: "Tuyệt vời! Tôi cũng đã đến đây vào tuần trước. Cảnh đẹp thật!",
    },
  },
  {
    _id: "notif3",
    recipient_id: "user1",
    sender_id: "user4",
    type: "follow",
    is_read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    sender: {
      _id: "user4",
      username: "tranminh",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
  },
  {
    _id: "notif4",
    recipient_id: "user1",
    sender_id: "user5",
    type: "reply",
    post_id: "post2",
    comment_id: "comment2",
    is_read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    sender: {
      _id: "user5",
      username: "lethihong",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    },
    post: {
      _id: "post2",
      content: "Hôm nay mình đã thử quán cà phê mới mở ở quận 1.",
    },
    comment: {
      _id: "comment2",
      content: "Quán này có không gian rất đẹp, phù hợp để làm việc!",
    },
  },
  {
    _id: "notif5",
    recipient_id: "user1",
    sender_id: "user2",
    type: "mention",
    post_id: "post3",
    is_read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    sender: {
      _id: "user2",
      username: "tranthiB",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    post: {
      _id: "post3",
      content: "Đang ăn tối cùng @nguyenvan tại nhà hàng mới mở!",
    },
  },
  {
    _id: "notif6",
    recipient_id: "user1",
    sender_id: "user3",
    type: "like",
    post_id: "post2",
    is_read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
    sender: {
      _id: "user3",
      username: "nguyenthao",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    post: {
      _id: "post2",
      content: "Hôm nay mình đã thử quán cà phê mới mở ở quận 1.",
    },
  },
  {
    _id: "notif7",
    recipient_id: "user1",
    sender_id: "user5",
    type: "comment",
    post_id: "post4",
    comment_id: "comment3",
    is_read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    sender: {
      _id: "user5",
      username: "lethihong",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    },
    post: {
      _id: "post4",
      content: "Đang làm việc trên một dự án mới về ứng dụng bản đồ.",
    },
    comment: {
      _id: "comment3",
      content: "Dự án này nghe có vẻ thú vị đấy! Bạn có thể chia sẻ thêm chi tiết không?",
    },
  },
  {
    _id: "notif8",
    recipient_id: "user1",
    sender_id: "user4",
    type: "like",
    post_id: "post4",
    is_read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    sender: {
      _id: "user4",
      username: "tranminh",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    post: {
      _id: "post4",
      content: "Đang làm việc trên một dự án mới về ứng dụng bản đồ.",
    },
  },
]

// Current user
export const currentUser = {
  _id: "user1",
  username: "nguyenvan",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
}
