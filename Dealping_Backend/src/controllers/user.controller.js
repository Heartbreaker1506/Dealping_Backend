const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ApiError = require("../utils/ApiError");

/**
 * Mở khóa ô theo dõi thứ 2 (unlockedSlot2 = true)
 * PATCH /api/users/unlock-slot-2
 * Authentication required
 */
exports.unlockSlot2 = async (req, res, next) => {
  try {
    const userId = req.user.id; // Lấy từ authMiddleware

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "Không tìm thấy người dùng");
    }

    if (user.unlockedSlot2) {
      return res.status(200).json({
        success: true,
        message: "Bạn đã mở khóa Ô số 2 từ trước rồi!",
      });
    }

    // Update DB
    await prisma.user.update({
      where: { id: userId },
      data: { unlockedSlot2: true },
    });

    res.status(200).json({
      success: true,
      message: "Chúc mừng! Bạn đã mở khóa thành công Ô theo dõi thứ 2.",
    });
  } catch (error) {
    next(error);
  }
};
