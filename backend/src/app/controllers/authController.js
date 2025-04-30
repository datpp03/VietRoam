// controllers/authController.js
const admin = require("../../configs/firebase");
const jwt = require("jsonwebtoken");
const { User } = require("../../models");

class AuthController {
  constructor() {
    this.generateToken = this.generateToken.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.verifyToken = this.verifyToken.bind(this); // Bind phương thức mới
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
      // console.log("Google ID token:", idToken);
      
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
      // console.log(user,token);
      
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

  // Phương thức mới để xác minh token
  async verifyToken(req, res) {
    try {
      // Lấy token từ header Authorization (Bearer <token>)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format"
        });
      }

      const token = authHeader.split(" ")[1]; // Lấy token sau "Bearer"

      // Xác minh JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm người dùng trong cơ sở dữ liệu
      const user = await User.findById(decoded.id).select(
        "_id email full_name profile_picture role"
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Trả về thông tin xác minh
      res.json({
        success: true,
        valid: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.full_name,
          avatar: user.profile_picture,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Token verification error:", error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired"
        });
      }
      res.status(401).json({
        success: false,
        message: "Invalid token",
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();