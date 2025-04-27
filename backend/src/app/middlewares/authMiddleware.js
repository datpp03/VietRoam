import jwt from 'jsonwebtoken';
import { User } from '../../models';

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra người dùng trong database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }
    
    // Lưu thông tin người dùng vào request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
      error: error.message
    });
  }
};

export default authMiddleware;