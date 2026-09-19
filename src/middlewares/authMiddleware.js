const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

/**
 * Middleware kiểm tra JWT từ Header (Authorization: Bearer <token>)
 */
exports.verifyAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Bạn chưa đăng nhập hoặc token không đúng định dạng (Bearer Token)");
    }

    const token = authHeader.split(" ")[1];
    
    // Giải mã JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    
    // Gán thông tin giải mã vào req.user để các Controller phía sau sử dụng
    req.user = decoded;
    
    next();
  } catch (error) {
    // Nếu token hết hạn hoặc sai
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Token không hợp lệ"));
    }
    next(error);
  }
};
