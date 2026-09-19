const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { parseShopeeLink } = require("./shopeeLinkParser");
const { fetchCurrentPrice } = require("./shopeePriceService");

/**
 * unlockedSlot2 = false -> tối đa 1 item
 * unlockedSlot2 = true  -> tối đa 2 item (hard cap theo yêu cầu)
 */
function getMaxSlots(user) {
  return user.unlockedSlot2 ? 2 : 1;
}

async function createTrackingItem({ userId, shopeeUrl, targetPrice }) {
  if (!userId || !shopeeUrl || targetPrice === undefined) {
    throw new ApiError(400, "Thiếu userId, shopeeUrl hoặc targetPrice");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "Không tìm thấy user");
  }

  // ---- VALIDATION CỨNG: chặn tạo item thứ 3 (hoặc thứ 2 nếu chưa unlock) ----
  const currentCount = await prisma.trackingItem.count({ where: { userId } });
  const maxSlots = getMaxSlots(user);

  if (currentCount >= maxSlots) {
    throw new ApiError(
      400,
      `Bạn đã đạt giới hạn ${maxSlots} sản phẩm theo dõi. Vui lòng xoá bớt hoặc mở khoá thêm slot.`
    );
  }
  // ---------------------------------------------------------------------

  const { itemId, shopId, resolvedUrl } = await parseShopeeLink(shopeeUrl);

  // Kiểm tra user đã theo dõi item này chưa (tránh trùng lặp trong 2 slot)
  const existing = await prisma.trackingItem.findFirst({
    where: { userId, itemId: BigInt(itemId) },
  });
  if (existing) {
    throw new ApiError(400, "Bạn đã theo dõi sản phẩm này rồi");
  }

  let currentPrice = null;
  let productName = null;
  try {
    const priceInfo = await fetchCurrentPrice(itemId, shopId);
    currentPrice = priceInfo.price;
    productName = priceInfo.productName;
  } catch {
    // Không chặn việc tạo item nếu Shopee tạm thời không phản hồi -
    // job check giá định kỳ sẽ tự cập nhật lại sau.
  }

  const item = await prisma.trackingItem.create({
    data: {
      userId,
      productName,
      itemId: BigInt(itemId),
      shopId: BigInt(shopId),
      originalPrice: currentPrice,
      targetPrice,
      shopeeUrl: resolvedUrl,
      status: "TRACKING",
    },
  });

  return serializeItem(item);
}

async function listTrackingItems(userId) {
  if (!userId) throw new ApiError(400, "Thiếu userId");
  const items = await prisma.trackingItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return items.map(serializeItem);
}

async function deleteTrackingItem(id, userId) {
  const item = await prisma.trackingItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) {
    throw new ApiError(404, "Không tìm thấy item để xoá");
  }
  await prisma.trackingItem.delete({ where: { id } });
}

// BigInt không tự serialize sang JSON được -> convert sang string trước khi trả response
function serializeItem(item) {
  return {
    ...item,
    itemId: item.itemId?.toString() ?? null,
    shopId: item.shopId?.toString() ?? null,
  };
}

module.exports = {
  getMaxSlots,
  createTrackingItem,
  listTrackingItems,
  deleteTrackingItem,
};
