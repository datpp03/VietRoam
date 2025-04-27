// controllers/authController.js
const admin = require("../../configs/firebase");
const jwt = require("jsonwebtoken");
const { User } = require("../../models");

class AuthController {
  constructor() {
    this.generateToken = this.generateToken.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
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
          social_links: {}
        });
      }

      // 4. Cập nhật thông tin đăng nhập
      user.last_login = new Date();
      user.login_count += 1;
      await user.save();

      // 5. Tạo JWT
      const token = this.generateToken(user);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.full_name,
          avatar: user.profile_picture,
          role: user.role
        }
      });

    } catch (error) {
      console.error("Google login error:", error);
      res.status(401).json({
        success: false,
        message: "Authentication failed",
        error: error.message
      });
    }
  }
}

module.exports = new AuthController(); // Xuất instance của class