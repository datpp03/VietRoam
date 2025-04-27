// Current user
export const currentUser = {
  _id: "user1",
  username: "nguyenvan",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  isOnline: true,
}

// Sample users
export const sampleUsers = [
  {
    _id: "user1",
    username: "nguyenvan",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    isOnline: true,
  },
  {
    _id: "user2",
    username: "tranthiB",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    isOnline: false,
  },
  {
    _id: "user3",
    username: "nguyenthao",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    isOnline: true,
  },
  {
    _id: "user4",
    username: "tranminh",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    isOnline: false,
  },
  {
    _id: "user5",
    username: "lethihong",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    isOnline: true,
  },
]

// Sample conversations
export const sampleConversations = [
  {
    _id: "conv1",
    conversation_id: "user1_user2",
    participants: ["user1", "user2"],
    last_message: {
      content: "Bạn đã xem video mới của tôi chưa?",
      sender_id: "user2",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      is_read: true,
    },
    unread_count: 0,
  },
  {
    _id: "conv2",
    conversation_id: "user1_user3",
    participants: ["user1", "user3"],
    last_message: {
      content: "Hẹn gặp bạn vào ngày mai nhé!",
      sender_id: "user3",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      is_read: false,
    },
    unread_count: 3,
  },
  {
    _id: "conv3",
    conversation_id: "user1_user4",
    participants: ["user1", "user4"],
    last_message: {
      content: "Cảm ơn bạn đã chia sẻ bài viết của tôi",
      sender_id: "user1",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      is_read: true,
    },
    unread_count: 0,
  },
  {
    _id: "conv4",
    conversation_id: "user1_user5",
    participants: ["user1", "user5"],
    last_message: {
      content: "Bạn có thể gửi cho tôi địa chỉ của quán cà phê đó không?",
      sender_id: "user5",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      is_read: true,
    },
    unread_count: 0,
  },
]

// Sample messages for each conversation
export const sampleMessages = {
  user1_user2: [
    {
      _id: "msg1",
      sender_id: "user1",
      receiver_id: "user2",
      content: "Chào bạn, dạo này bạn khỏe không?",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
      _id: "msg2",
      sender_id: "user2",
      receiver_id: "user1",
      content: "Chào bạn! Tôi khỏe, cảm ơn bạn đã hỏi thăm. Còn bạn thì sao?",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55 minutes ago
    },
    {
      _id: "msg3",
      sender_id: "user1",
      receiver_id: "user2",
      content: "Tôi cũng khỏe. Tôi vừa đăng một video mới về chuyến du lịch Đà Lạt tuần trước.",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(), // 50 minutes ago
    },
    {
      _id: "msg4",
      sender_id: "user1",
      receiver_id: "user2",
      content: "Bạn có thời gian xem không?",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 49).toISOString(), // 49 minutes ago
    },
    {
      _id: "msg5",
      sender_id: "user2",
      receiver_id: "user1",
      content: "Tất nhiên rồi! Tôi rất thích Đà Lạt. Để tôi xem ngay.",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    },
    {
      _id: "msg6",
      sender_id: "user2",
      receiver_id: "user1",
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1000&auto=format&fit=crop",
          filename: "dalat.jpg",
        },
      ],
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(), // 40 minutes ago
    },
    {
      _id: "msg7",
      sender_id: "user2",
      receiver_id: "user1",
      content: "Đây là ảnh tôi chụp ở Đà Lạt năm ngoái. Đẹp phải không?",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 39).toISOString(), // 39 minutes ago
    },
    {
      _id: "msg8",
      sender_id: "user1",
      receiver_id: "user2",
      content: "Wow, đẹp quá! Bạn chụp ở đâu vậy?",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 minutes ago
    },
    {
      _id: "msg9",
      sender_id: "user2",
      receiver_id: "user1",
      content: "Đây là ở gần Hồ Xuân Hương. Lần sau chúng ta có thể đi cùng nhau!",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      _id: "msg10",
      sender_id: "user1",
      receiver_id: "user2",
      content: "Tuyệt vời! Tôi sẽ liên hệ với bạn khi có kế hoạch.",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
    },
    {
      _id: "msg11",
      sender_id: "user2",
      receiver_id: "user1",
      content: "Bạn đã xem video mới của tôi chưa?",
      conversation_id: "user1_user2",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
  ],
  user1_user3: [
    {
      _id: "msg12",
      sender_id: "user3",
      receiver_id: "user1",
      content: "Chào bạn, tôi rất thích bài viết mới nhất của bạn!",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      _id: "msg13",
      sender_id: "user1",
      receiver_id: "user3",
      content: "Cảm ơn bạn rất nhiều! Tôi rất vui khi bạn thích nó.",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(), // 115 minutes ago
    },
    {
      _id: "msg14",
      sender_id: "user3",
      receiver_id: "user1",
      content: "Bạn có kế hoạch gì cho cuối tuần này không?",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(), // 100 minutes ago
    },
    {
      _id: "msg15",
      sender_id: "user1",
      receiver_id: "user3",
      content: "Tôi dự định đi cafe và làm việc một chút. Còn bạn?",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(), // 95 minutes ago
    },
    {
      _id: "msg16",
      sender_id: "user3",
      receiver_id: "user1",
      content: "Tôi đang nghĩ đến việc đi xem phim. Bạn có muốn đi cùng không?",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90 minutes ago
    },
    {
      _id: "msg17",
      sender_id: "user1",
      receiver_id: "user3",
      content: "Nghe có vẻ thú vị đấy! Phim gì vậy?",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(), // 85 minutes ago
    },
    {
      _id: "msg18",
      sender_id: "user3",
      receiver_id: "user1",
      content: "Tôi đang nghĩ đến phim mới của Marvel. Nghe nói rất hay!",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(), // 80 minutes ago
    },
    {
      _id: "msg19",
      sender_id: "user1",
      receiver_id: "user3",
      content: "Tuyệt! Vậy mình hẹn nhau lúc mấy giờ?",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 75 minutes ago
    },
    {
      _id: "msg20",
      sender_id: "user3",
      receiver_id: "user1",
      content: "Khoảng 7 giờ tối mai nhé? Tôi sẽ đặt vé trước.",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(), // 70 minutes ago
    },
    {
      _id: "msg21",
      sender_id: "user1",
      receiver_id: "user3",
      content: "Được rồi, tôi sẽ đến đúng giờ!",
      conversation_id: "user1_user3",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(), // 65 minutes ago
    },
    {
      _id: "msg22",
      sender_id: "user3",
      receiver_id: "user1",
      content: "Hẹn gặp bạn vào ngày mai nhé!",
      conversation_id: "user1_user3",
      is_read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      _id: "msg23",
      sender_id: "user3",
      receiver_id: "user1",
      content: "Nhớ mang theo áo khoác, dự báo thời tiết nói trời sẽ lạnh đấy.",
      conversation_id: "user1_user3",
      is_read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
    },
    {
      _id: "msg24",
      sender_id: "user3",
      receiver_id: "user1",
      content: "À, và tôi sẽ đợi bạn ở quầy vé nhé!",
      conversation_id: "user1_user3",
      is_read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
    },
  ],
  user1_user4: [
    {
      _id: "msg25",
      sender_id: "user4",
      receiver_id: "user1",
      content: "Chào bạn, tôi vừa xem bài viết của bạn về kỹ thuật chụp ảnh.",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      _id: "msg26",
      sender_id: "user4",
      receiver_id: "user1",
      content: "Bạn có thể chia sẻ thêm về cách điều ch��nh ISO không?",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.9).toISOString(), // 4.9 hours ago
    },
    {
      _id: "msg27",
      sender_id: "user1",
      receiver_id: "user4",
      content: "Chào bạn! Tất nhiên rồi. ISO ảnh hưởng đến độ nhạy sáng của cảm biến.",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.8).toISOString(), // 4.8 hours ago
    },
    {
      _id: "msg28",
      sender_id: "user1",
      receiver_id: "user4",
      content:
        "ISO cao giúp chụp trong điều kiện thiếu sáng nhưng sẽ tạo nhiễu. ISO thấp cho chất lượng tốt nhất nhưng cần nhiều ánh sáng.",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.7).toISOString(), // 4.7 hours ago
    },
    {
      _id: "msg29",
      sender_id: "user4",
      receiver_id: "user1",
      content: "Cảm ơn bạn! Vậy trong điều kiện ánh sáng yếu, tôi nên chọn ISO bao nhiêu là tốt nhất?",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString(), // 4.5 hours ago
    },
    {
      _id: "msg30",
      sender_id: "user1",
      receiver_id: "user4",
      content:
        "Điều đó phụ thuộc vào máy ảnh của bạn. Máy ảnh hiện đại có thể xử lý tốt ở ISO 1600-3200 mà không quá nhiễu.",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.3).toISOString(), // 4.3 hours ago
    },
    {
      _id: "msg31",
      sender_id: "user1",
      receiver_id: "user4",
      content: "Tôi khuyên bạn nên thử nghiệm với máy ảnh của mình để tìm ra giới hạn ISO tốt nhất.",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.2).toISOString(), // 4.2 hours ago
    },
    {
      _id: "msg32",
      sender_id: "user4",
      receiver_id: "user1",
      content: "Tuyệt vời! Tôi sẽ thử. Bạn có thể chia sẻ một số ảnh bạn đã chụp không?",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    },
    {
      _id: "msg33",
      sender_id: "user1",
      receiver_id: "user4",
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1000&auto=format&fit=crop",
          filename: "landscape.jpg",
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?q=80&w=1000&auto=format&fit=crop",
          filename: "night_sky.jpg",
        },
      ],
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.8).toISOString(), // 3.8 hours ago
    },
    {
      _id: "msg34",
      sender_id: "user1",
      receiver_id: "user4",
      content: "Đây là một số ảnh tôi chụp. Ảnh đầu tiên dùng ISO 100, ảnh thứ hai dùng ISO 3200 cho cảnh đêm.",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.7).toISOString(), // 3.7 hours ago
    },
    {
      _id: "msg35",
      sender_id: "user4",
      receiver_id: "user1",
      content: "Ảnh đẹp quá! Cảm ơn bạn đã chia sẻ bài viết của tôi.",
      conversation_id: "user1_user4",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
  ],
  user1_user5: [
    {
      _id: "msg36",
      sender_id: "user5",
      receiver_id: "user1",
      content: "Chào bạn, tôi thấy bạn check-in ở một quán cà phê ở quận 1 hôm qua.",
      conversation_id: "user1_user5",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
    },
    {
      _id: "msg37",
      sender_id: "user1",
      receiver_id: "user5",
      content: "Đúng rồi! Đó là quán The Coffee House. Không gian rất đẹp và yên tĩnh.",
      conversation_id: "user1_user5",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 29.8).toISOString(), // 29.8 hours ago
    },
    {
      _id: "msg38",
      sender_id: "user5",
      receiver_id: "user1",
      content: "Nghe có vẻ thú vị! Tôi đang tìm một nơi để làm việc vào cuối tuần này.",
      conversation_id: "user1_user5",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 29.5).toISOString(), // 29.5 hours ago
    },
    {
      _id: "msg39",
      sender_id: "user1",
      receiver_id: "user5",
      content: "Quán đó rất phù hợp để làm việc. Họ có wifi tốc độ cao và nhiều ổ cắm điện.",
      conversation_id: "user1_user5",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 29.2).toISOString(), // 29.2 hours ago\
    },
    {
      _id: "msg40",
      sender_id: "user5",
      receiver_id: "user1",
      content: "Tuyệt vời! Bạn có thể gửi cho tôi địa chỉ của quán cà phê đó không?ng?",
      conversation_id: "user1_user5",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
    },
    {
      _id: "msg41",
      sender_id: "user1",
      receiver_id: "user5",
      content: "Dĩ nhiên rồi! Địa chỉ là 141 Nguyễn Huệ, Quận 1, TP.HCM. Họ mở cửa từ 7h sáng đến 10h tối.",
      conversation_id: "user1_user5",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), // 23 hours ago
    },
    {
      _id: "msg42",
      sender_id: "user5",
      receiver_id: "user1",
      content: "Cảm ơn bạn rất nhiều! Tôi sẽ ghé qua đó vào cuối tuần này.",
      conversation_id: "user1_user5",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    },
    {
      _id: "msg43",
      sender_id: "user1",
      receiver_id: "user5",
      content: "Không có gì! Chúc bạn có trải nghiệm tốt.",
      conversation_id: "user1_user5",
      is_read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(), // 21 hours ago
    },
  ],
}

// Sample messages for new conversations
export const emptySampleMessages = {
  user1_user5: [],
}
