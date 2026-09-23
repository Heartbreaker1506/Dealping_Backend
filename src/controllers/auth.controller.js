const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { verifyFirebaseToken } = require("../services/firebaseAuth");
const ApiError = require("../utils/ApiError");

/**
 * API Đăng nhập 1 chạm
 * POST /api/auth/verify-token
 * Body: { idToken: "..." }
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw new ApiError(400, "Vui lòng cung cấp idToken từ Firebase");
    }

    // 1. Dùng Firebase Admin SDK để xác thực Token (thời gian < 50ms)
    // Nếu token giả, hết hạn -> bắn lỗi
    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken);
    } catch (err) {
      throw new ApiError(401, "Xác thực token thất bại: " + err.message);
    }

    // Lấy email từ token (hoặc uid tùy chiến lược của bạn)
    const { email } = decoded;
    if (!email) {
      throw new ApiError(400, "Token hợp lệ nhưng không chứa địa chỉ email");
    }

    // 2. Tìm hoặc Tạo User trong DB dựa theo email
    // Vì kiến trúc của chúng ta có hard limit, ta cần trả về cấu hình unlockedSlot2
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email,
          // Có thể lưu thêm uid từ Firebase vào đây nếu bạn muốn tạo cột uid
        },
      });
    }

    // 3. Sinh ra JWT (nội bộ của Backend)
    // Client sẽ dùng token này cho mọi API sau này
    const payload = {
      id: user.id,
      email: user.email,
      unlockedSlot2: user.unlockedSlot2,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d", // Sống 7 ngày
    });

    // 4. Trả về cho client
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        unlockedSlot2: user.unlockedSlot2,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API Xử lý Callback từ Lazada
 * GET /api/auth/callback
 */
exports.lazadaCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new ApiError(400, "Không tìm thấy authorization code từ Lazada");
    }

    // TODO: Xử lý logic gọi API Lazada để đổi code lấy access token ở đây
    
    res.status(200).json({
      success: true,
      message: "Đã nhận được callback từ Lazada",
      code,
    });
  } catch (error) {
    next(error);
  }
};
