const { Post, User, Like, Comment, Follow, Notification } = require('../../models');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const mongoose = require("mongoose");

const createPost = async (req, res) => {
  try {
    const { content, location, tags, status, visibility } = req.body;
    const userId = req.user.id;
    const files = req.files || [];

    // Input validation
    if (!content || content.length < 10 || content.length > 2000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nội dung phải từ 10 đến 2000 ký tự' 
      });
    }

    if (files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cần ít nhất một hình ảnh hoặc video' 
      });
    }

    // Media type validation
    const mediaTypes = new Set(files.map(file => file.mimetype.startsWith('image/') ? 'image' : 'video'));
    if (mediaTypes.size > 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chỉ cho phép hình ảnh hoặc video, không được cả hai' 
      });
    }

    // Media count validation
    const isVideo = mediaTypes.has('video');
    if (isVideo && files.length > 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chỉ được phép đăng một video' 
      });
    }
    if (!isVideo && files.length > 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tối đa 50 hình ảnh được phép' 
      });
    }

    // Process and save media files
    const media = await Promise.all(files.map(async (file) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(__dirname, '../../../Uploads', fileName);
      
      await fs.writeFile(filePath, file.buffer);

      return {
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        url: `http://localhost:3001/Uploads/${fileName}`,
        thumbnail: isVideo ? undefined : undefined,
        description: '',
      };
    }));

    let parsedLocation = undefined;
    if (location) {
      try {
        const locationData = JSON.parse(location);
        parsedLocation = {
          type: 'Point',
          coordinates: locationData.coordinates || [],
          name: locationData.name,
          address: locationData.address,
        };
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng vị trí không hợp lệ',
        });
      }
    }

    const postData = {
      user_id: userId,
      content,
      media,
      location: parsedLocation,
      tags: tags ? JSON.parse(tags) : [],
      status: status || 'published',
      visibility: visibility || 'public',
    };

    const post = new Post(postData);
    await post.save();

    await User.findByIdAndUpdate(userId, { $inc: { posts_count: 1 } });

    return res.status(201).json({
      success: true,
      message: 'Đăng bài viết thành công',
      post,
    });
  } catch (error) {
    console.error('Lỗi khi tạo bài viết:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu postId hoặc userId',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    const existingLike = await Like.findOne({ post_id: postId, user_id: userId });
    let liked = false;
    let likes_count = post.likes_count;

    if (existingLike) {
      await Like.deleteOne({ post_id: postId, user_id: userId });
      likes_count = Math.max(0, likes_count - 1);
      
      // Xóa thông báo like liên quan
      await Notification.deleteOne({
        user_id: post.user_id,
        sender_id: userId,
        type: 'like',
        post_id: postId
      });
    } else {
      await Like.create({ post_id: postId, user_id: userId });
      likes_count += 1;
      liked = true;

      // Tạo thông báo khi thích bài viết (nếu không phải chính người đăng bài thích)
      if (post.user_id.toString() !== userId) {
        const notification = new Notification({
          user_id: post.user_id, // Người nhận thông báo (người đăng bài)
          sender_id: userId, // Người thực hiện hành động (người thích bài)
          type: 'like',
          post_id: postId,
          is_read: false
        });
        await notification.save();
      }
    }

    await Post.findByIdAndUpdate(postId, { likes_count });

    return res.status(200).json({
      success: true,
      liked,
      likes_count,
    });
  } catch (error) {
    console.error('Lỗi khi thả tim:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};


const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const query = { 
      status: 'published', 
      user_id: userId, 
      visibility: { $in: ['followers', 'public'] } // Add visibility filter
    };    
  
    const posts = await Post.find(query)
      .populate('user_id', 'full_name profile_picture email')
      .sort({ createdAt: -1 })
      .lean();

    // Add liked_by array for each post
    const postIds = posts.map(post => post._id);
    const likes = await Like.find({ post_id: { $in: postIds } }).lean();
    
    const postsWithLikes = posts.map(post => ({
      ...post,
      liked_by: likes
        .filter(like => like.post_id.toString() === post._id.toString())
        .map(like => like.user_id.toString()),
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithLikes,
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết 1:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const getLikedPosts = async (req, res) => {
  try {
    const { myId } = req.params;
    const postLikeIds = await Like.find({ user_id: myId })
      .select('post_id')
      .then(likes => likes.map(like => like.post_id));
    if (!postLikeIds.length) {
      return res.status(200).json({
        success: true,
        posts: [],
      });
    }
    const query = {
      _id: { $in: postLikeIds },
      user_id: { $ne: myId },
      $or: [
        { status: 'published', visibility: 'public' },
        { status: 'published', visibility: 'followers' },
      ],
    };

    const posts = await Post.find(query)
      .populate('user_id', 'full_name profile_picture email')
      .sort({ createdAt: -1 })
      .lean();

    // Add liked_by array for each post
    const postIds = posts.map(post => post._id);
    const likes = await Like.find({ post_id: { $in: postIds } }).lean();

    const postsWithLikes = posts.map(post => ({
      ...post,
      liked_by: likes
        .filter(like => like.post_id.toString() === post._id.toString())
        .map(like => like.user_id.toString()),
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithLikes,
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết 2:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const {userId} = req.params;
    const query = { status: 'published', user_id: userId };    
  
    const posts = await Post.find(query)
      .populate('user_id', 'full_name profile_picture email')
      .sort({ createdAt: -1 })
      .lean();

    // Add liked_by array for each post
    const postIds = posts.map(post => post._id);
    const likes = await Like.find({ post_id: { $in: postIds } }).lean();
    
    const postsWithLikes = posts.map(post => ({
      ...post,
      liked_by: likes.filter(like => like.post_id.toString() === post._id.toString()).map(like => like.user_id.toString()),
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithLikes,
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết 3:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const getPostsFollowing = async (req, res) => {
  try {
    const {myId} = req.params;
    const followings = await Follow.find({ follower: myId }).select('following');
    const followingIds = followings.map(f => f.following);
    let query = { status: 'published', visibility: 'followers', user_id: { $in: followingIds }  };    
    const posts = await Post.find(query)
      .populate('user_id', 'full_name profile_picture email')
      .sort({ createdAt: -1 })
      .lean();

    // Add liked_by array for each post
    const postIds = posts.map(post => post._id);
    const likes = await Like.find({ post_id: { $in: postIds } }).lean();
    
    const postsWithLikes = posts.map(post => ({
      ...post,
      liked_by: likes.filter(like => like.post_id.toString() === post._id.toString()).map(like => like.user_id.toString()),
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithLikes,
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết 4:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const getPostsIsLogin = async (req, res) => {
  try {
    const {myId} = req.params;
    let query = { status: 'published' };    
    // If user is authenticated, include posts they can see based on visibility
    if (myId) {
      const followings = await Follow.find({ follower: myId }).select('following');
      const followingIds = followings.map(f => f.following);
      
      query = {
        $or: [
          { status: 'published', visibility: 'public' },
          { status: 'published', visibility: 'followers', user_id: { $in: followingIds } },
          { status: 'published', user_id: myId },
        ],
      };
    } else {
      query = { status: 'published', visibility: 'public' };
    }

    const posts = await Post.find(query)
      .populate('user_id', 'full_name profile_picture email')
      .sort({ createdAt: -1 })
      .lean();

    // Add liked_by array for each post
    const postIds = posts.map(post => post._id);
    const likes = await Like.find({ post_id: { $in: postIds } }).lean();
    
    const postsWithLikes = posts.map(post => ({
      ...post,
      liked_by: likes.filter(like => like.post_id.toString() === post._id.toString()).map(like => like.user_id.toString()),
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithLikes,
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết 5:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const getPosts = async (req, res) => {
  try {
   
    let query = { status: 'published', visibility: 'public' };

    const posts = await Post.find(query)
      .populate('user_id', 'full_name profile_picture email')
      .sort({ createdAt: -1 })
      .lean();

    // Add liked_by array for each post
    const postIds = posts.map(post => post._id);
    const likes = await Like.find({ post_id: { $in: postIds } }).lean();
    
    const postsWithLikes = posts.map(post => ({
      ...post,
      liked_by: likes.filter(like => like.post_id.toString() === post._id.toString()).map(like => like.user_id.toString()),
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithLikes,
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết 6:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    const comments = await Comment.find({ post_id: postId })
      .populate('user_id', 'full_name profile_picture email')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      comments: comments.map(comment => ({
        ...comment,
        user: {
          _id: comment.user_id._id,
          full_name: comment.user_id.full_name,
          profile_picture: comment.user_id.profile_picture,
          email: comment.user_id.email,
        },
      })),
    });
  } catch (error) {
    console.error('Lỗi khi lấy bình luận:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    if (!content || content.length < 1 || content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận phải từ 1 đến 1000 ký tự',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    const comment = new Comment({
      post_id: postId,
      user_id: userId,
      content,
    });

    await comment.save();

    await Post.findByIdAndUpdate(postId, { $inc: { comments_count: 1 } });

    // Tạo thông báo khi bình luận bài viết (nếu không phải chính người đăng bài bình luận)
    if (post.user_id.toString() !== userId) {
      const notification = new Notification({
        user_id: post.user_id, // Người nhận thông báo (người đăng bài)
        sender_id: userId, // Người thực hiện hành động (người bình luận)
        type: 'comment',
        post_id: postId,
        comment_id: comment._id,
        is_read: false
      });
      await notification.save();
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('user_id', 'full_name profile_picture email')
      .lean();

    return res.status(201).json({
      success: true,
      comment: {
        ...populatedComment,
        user: {
          _id: populatedComment.user_id._id,
          full_name: populatedComment.user_id.full_name,
          profile_picture: populatedComment.user_id.profile_picture,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi khi tạo bình luận:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    if (post.user_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này',
      });
    }

    // Xóa các bình luận, lượt thích và thông báo liên quan
    await Comment.deleteMany({ post_id: postId });
    await Like.deleteMany({ post_id: postId });
    await Notification.deleteMany({ post_id: postId });

    // Xóa bài viết
    await Post.findByIdAndDelete(postId);

    // Cập nhật số lượng bài viết của người dùng
    await User.findByIdAndUpdate(userId, { $inc: { posts_count: -1 } });

    return res.status(200).json({
      success: true,
      message: 'Xóa bài viết thành công',
    });
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const archivePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    if (post.user_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền khóa bài viết này',
      });
    }

    post.status = 'archived';
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Khóa bài viết thành công',
      post,
    });
  } catch (error) {
    console.error('Lỗi khi khóa bài viết:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

const updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status, visibility } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại',
      });
    }

    if (post.user_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật bài viết này',
      });
    }

    if (status && !['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }

    if (visibility && !['public', 'private', 'followers'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: 'Chế độ hiển thị không hợp lệ',
      });
    }

    if (status) post.status = status;
    if (visibility) post.visibility = visibility;

    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái bài viết thành công',
      post,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái bài viết:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
const getLocationStats = async (req, res)  =>  {
  try {
    const { minPosts, country, city } = req.query;
    console.log("Query params:", req.query);
    
    // Xây dựng pipeline aggregation
    let matchStage = { status: "published" }; // Chỉ lấy bài viết đã xuất bản
    if (country) {
      matchStage["location.name"] = { $regex: country, $options: "i" };
    }
    if (city) {
      matchStage["location.name"] = { $regex: city, $options: "i" };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            name: "$location.name",
            coordinates: "$location.coordinates",
          },
          postCount: { $sum: 1 },
        },
      },
      {
        $match: minPosts ? { postCount: { $gte: parseInt(minPosts) } } : {},
      },
      {
        $sort: { postCount: -1 },
      },
      {
        $project: {
          name: "$_id.name",
          coordinates: "$_id.coordinates",
          postCount: 1,
          _id: 0,
        },
      },
    ];

    const stats = await Post.aggregate(pipeline);

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching location stats:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}
module.exports = {getLocationStats, createPost, toggleLike, getPosts, getComments, getMyPosts, getLikedPosts, createComment, getPostsIsLogin, getPostsFollowing, getUserPosts, deletePost, archivePost, updatePostStatus };