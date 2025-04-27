// Sample users based on the provided schema
export const sampleUsers = [
  {
    _id: "user123",
    email: "johndoe@example.com",
    full_name: "John Doe",
    profile_picture: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Travel enthusiast and photographer. Exploring the world one country at a time. Join me on my adventures!",
    travel_interests: ["Adventure", "Nature", "Cultural"],
    role: "user",
    location: {
      country: "United States",
      city: "New York",
    },
    is_verified: true,
    last_login: new Date("2023-12-01"),
    login_count: 42,
    followers_count: 12500,
    following_count: 350,
    createdAt: new Date("2022-01-15"),
    updatedAt: new Date("2023-11-20"),
    isFollowing: false,
  },
  {
    _id: "user1",
    email: "emmawilson@example.com",
    full_name: "Emma Wilson",
    profile_picture: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Professional travel blogger exploring the world one country at a time. Join me on my adventures!",
    travel_interests: ["Cultural", "Food", "Historical"],
    role: "user",
    location: {
      country: "Canada",
      city: "Toronto",
    },
    is_verified: true,
    last_login: new Date("2023-12-05"),
    login_count: 78,
    followers_count: 15420,
    following_count: 532,
    createdAt: new Date("2022-03-10"),
    updatedAt: new Date("2023-11-25"),
    isFollowing: true,
  },
  {
    _id: "user2",
    email: "michaelchen@example.com",
    full_name: "Michael Chen",
    profile_picture: "https://randomuser.me/api/portraits/men/45.jpg",
    bio: "Landscape photographer and hiking enthusiast. Always seeking the next mountain to climb.",
    travel_interests: ["Nature", "Adventure", "Beach"],
    role: "user",
    location: {
      country: "United States",
      city: "Seattle",
    },
    is_verified: false,
    last_login: new Date("2023-12-03"),
    login_count: 56,
    followers_count: 8932,
    following_count: 721,
    createdAt: new Date("2022-05-20"),
    updatedAt: new Date("2023-11-15"),
    isFollowing: true,
  },
]

// Sample posts
export const samplePosts = [
  {
    _id: "post1",
    user_id: "user123",
    content:
      "Amazing sunset at the Grand Canyon! One of the most breathtaking views I've ever seen. #travel #grandcanyon #sunset",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1501786223405-2fd7a761c7b9?q=80&w=1000&auto=format&fit=crop",
      },
    ],
    location: {
      name: "Grand Canyon National Park",
      coordinates: [-112.1121, 36.0544],
    },
    likes_count: 1245,
    comments_count: 87,
    created_at: "2023-06-15T14:23:45Z",
    liked_by: ["user1", "user2"],
    saved_by: ["user1"],
  },
  {
    _id: "post2",
    user_id: "user123",
    content:
      "Exploring the streets of Tokyo. The blend of traditional and modern architecture is fascinating! #japan #tokyo #travel",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop",
      },
    ],
    location: {
      name: "Shibuya, Tokyo",
      coordinates: [139.7016, 35.6581],
    },
    likes_count: 982,
    comments_count: 56,
    created_at: "2023-07-02T09:15:30Z",
    liked_by: ["user2"],
    saved_by: ["user2", "user1"],
  },
  {
    _id: "post3",
    user_id: "user123",
    content:
      "Hiking through the lush rainforests of Costa Rica. The biodiversity here is incredible! #costarica #nature #hiking",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1536152470836-b943b246224c?q=80&w=1000&auto=format&fit=crop",
      },
    ],
    location: {
      name: "Monteverde Cloud Forest Reserve",
      coordinates: [-84.8093, 10.301],
    },
    likes_count: 756,
    comments_count: 42,
    created_at: "2023-08-10T16:45:12Z",
    liked_by: ["user1"],
    saved_by: [],
  },
  {
    _id: "post4",
    user_id: "user123",
    content:
      "Venice canals at sunset. There's nothing quite like exploring this city by gondola! #venice #italy #travel",
    media: [
      {
        type: "video",
        url: "https://example.com/videos/venice.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1000&auto=format&fit=crop",
      },
    ],
    location: {
      name: "Venice, Italy",
      coordinates: [12.3155, 45.4408],
    },
    likes_count: 1532,
    comments_count: 104,
    created_at: "2023-09-05T18:30:00Z",
    liked_by: ["user2", "user1"],
    saved_by: ["user1"],
  },
  {
    _id: "post5",
    user_id: "user123",
    content:
      "Desert safari in Dubai. Riding camels and watching the sunset over the dunes was an unforgettable experience! #dubai #desert #travel",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=1000&auto=format&fit=crop",
      },
    ],
    location: {
      name: "Dubai Desert Conservation Reserve",
      coordinates: [55.6642, 24.8101],
    },
    likes_count: 876,
    comments_count: 63,
    created_at: "2023-10-12T15:20:45Z",
    liked_by: [],
    saved_by: ["user2"],
  },
  {
    _id: "post6",
    user_id: "user123",
    content:
      "Exploring the ancient ruins of Machu Picchu. The history and views here are absolutely incredible! #machupicchu #peru #travel",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop",
      },
    ],
    location: {
      name: "Machu Picchu",
      coordinates: [-72.545, -13.1631],
    },
    likes_count: 2145,
    comments_count: 128,
    created_at: "2023-11-08T12:10:30Z",
    liked_by: ["user1", "user2"],
    saved_by: ["user1", "user2"],
  },
]

// Sample comments
export const sampleComments = [
  {
    _id: "comment1",
    post_id: "post1",
    user_id: "user1",
    content: "Absolutely stunning view! I've been wanting to visit the Grand Canyon for years.",
    created_at: "2023-06-15T15:30:45Z",
    likes_count: 12,
  },
  {
    _id: "comment2",
    post_id: "post1",
    user_id: "user2",
    content: "The colors in this photo are incredible. What camera did you use?",
    created_at: "2023-06-15T16:45:20Z",
    likes_count: 8,
  },
  {
    _id: "comment3",
    post_id: "post1",
    user_id: "user123",
    content: "Thanks! I used my Sony A7III with a 24-70mm lens.",
    created_at: "2023-06-15T17:10:05Z",
    likes_count: 5,
  },
  {
    _id: "comment4",
    post_id: "post2",
    user_id: "user2",
    content: "Tokyo is on my bucket list! How long did you stay there?",
    created_at: "2023-07-02T10:20:15Z",
    likes_count: 6,
  },
  {
    _id: "comment5",
    post_id: "post2",
    user_id: "user123",
    content: "I was there for two weeks. Definitely not enough time to see everything!",
    created_at: "2023-07-02T11:05:30Z",
    likes_count: 4,
  },
  {
    _id: "comment6",
    post_id: "post3",
    user_id: "user1",
    content: "Costa Rica has amazing biodiversity! Did you see any sloths?",
    created_at: "2023-08-10T18:30:45Z",
    likes_count: 9,
  },
  {
    _id: "comment7",
    post_id: "post4",
    user_id: "user2",
    content: "Venice is so romantic! The gondola rides are expensive but worth every penny.",
    created_at: "2023-09-05T20:15:10Z",
    likes_count: 15,
  },
  {
    _id: "comment8",
    post_id: "post5",
    user_id: "user1",
    content: "Dubai is such a contrast of ancient and ultra-modern. Did you visit the Burj Khalifa?",
    created_at: "2023-10-12T16:40:25Z",
    likes_count: 7,
  },
  {
    _id: "comment9",
    post_id: "post6",
    user_id: "user2",
    content: "Machu Picchu is breathtaking! How was the hike up?",
    created_at: "2023-11-08T14:25:40Z",
    likes_count: 11,
  },
  {
    _id: "comment10",
    post_id: "post6",
    user_id: "user1",
    content: "I've always wanted to visit Peru. This photo makes me want to book a trip right now!",
    created_at: "2023-11-08T15:50:15Z",
    likes_count: 8,
  },
]
