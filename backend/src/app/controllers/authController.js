// controllers/authController.js
const admin = require("../../configs/firebase");
const jwt = require("jsonwebtoken");
const { User, Follow } = require("../../models");

class AuthController {
  constructor() {
    this.generateToken = this.generateToken.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  }

  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;

      // 1. Xác thực Google ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // 2. Trích xuất thông tin người dùng
      const { uid, email, name, picture } = decodedToken;

      // 3. Tìm/Create user
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          full_name: name,
          profile_picture: picture,
          is_verified: true,
          travel_interests: [],
          social_links: {},
        });
      }
      if (!user.is_verified) {
        return res.status(403).json({
          success: false,
          message: "User is not verified",
        });
      }
      // 4. Cập nhật thông tin đăng nhập
      user.last_login = new Date();
      user.login_count += 1;
      await user.save();

      // 5. Lấy danh sách _id của người dùng đang theo dõi
      const following = await Follow.find({ follower: user._id }).select("following");
      const followingIds = following.map((f) => f.following);

      // 6. Tạo JWT
      const token = this.generateToken(user);

      res.json({
        success: true,
        token,
        following: followingIds,
        user: {
          id: user._id,
          email: user.email,
          name: user.full_name,
          avatar: user.profile_picture,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(401).json({
        success: false,
        message: "Authentication failed",
        error: error.message,
      });
    }
  }

  async verifyToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select(
        "_id email full_name profile_picture role"
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        valid: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.full_name,
          avatar: user.profile_picture,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Tokenスクリプト verification error:", error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }
      res.status(401).json({
        success: false,
        message: "Invalid token",
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();