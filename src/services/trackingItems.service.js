const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { parseShopeeLink, extractProductNameFromUrl, extractPriceFromUrl } = require("./linkParser.service");
const { fetchCurrentPrice } = require("./shopeePriceService");
const tiktokPriceService = require("./tiktokPriceService");

/**
 * unlockedSlot2 = false -> tối đa 1 item
 * unlockedSlot2 = true  -> tối đa 2 item (hard cap theo yêu cầu)
 */
function getMaxSlots(user) {
  return user.unlockedSlot2 ? 2 : 1;
}

async function createTrackingItem({
  userId,
  shopeeUrl,
  targetPrice,
  variantName,
  selectedModelId,
  productName: inputProductName,
  originalPrice: inputOriginalPrice,
}) {
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
  const existingWhere = itemId
    ? { userId, itemId: BigInt(itemId) }
    : { userId, shopeeUrl: resolvedUrl };

  const existing = await prisma.trackingItem.findFirst({
    where: existingWhere,
  });
  if (existing) {
    throw new ApiError(400, "Bạn đã theo dõi sản phẩm này rồi");
  }

  let currentPrice = inputOriginalPrice || null;
  let productName = inputProductName?.trim() || null;

  if (itemId && shopId) {
    try {
      const priceInfo = await fetchCurrentPrice(itemId, shopId, resolvedUrl);
      currentPrice = priceInfo.price;
      if (!productName) {
        productName = priceInfo.productName;
      }
    } catch {
      // Graceful Fallback: nếu Shopee chặn IP đám mây, không sập luồng
    }
  } else if (/tiktok/.test(resolvedUrl)) {
    try {
      const tiktokInfo = await tiktokPriceService.fetchCurrentPrice(resolvedUrl);
      currentPrice = tiktokInfo.price;
      if (!productName) {
        productName = tiktokInfo.productName;
      }
    } catch {}
  }

  // Thử trích xuất giá từ link nếu API bị chặn
  if (!currentPrice) {
    currentPrice = extractPriceFromUrl(resolvedUrl);
  }

  // Fallback an toàn: nếu chưa có tên sản phẩm, tự động bóc tách từ URL slug thật
  if (!productName) {
    productName = extractProductNameFromUrl(resolvedUrl) || "Sản phẩm theo dõi";
  }

  const item = await prisma.trackingItem.create({
    data: {
      userId,
      productName,
      itemId: itemId ? BigInt(itemId) : null,
      shopId: shopId ? BigInt(shopId) : null,
      originalPrice: currentPrice,
      targetPrice,
      shopeeUrl: resolvedUrl,
      status: "TRACKING",
      variantName,
      selectedModelId: selectedModelId ? BigInt(selectedModelId) : null,
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
    selectedModelId: item.selectedModelId?.toString() ?? null,
  };
}

async function getTrackingItemHistory(id) {
  const item = await prisma.trackingItem.findUnique({ where: { id } });
  if (!item) {
    throw new ApiError(404, "Không tìm thấy item");
  }

  const history = await prisma.priceHistory.findMany({
    where: { trackingItemId: id },
    orderBy: { timestamp: "desc" },
  });

  return history;
}

async function previewTrackingItem(shopeeUrl) {
  if (!shopeeUrl) throw new ApiError(400, "Thiếu shopeeUrl");
  const { itemId, shopId, resolvedUrl } = await parseShopeeLink(shopeeUrl);
  
  let productName = null;
  let currentPrice = null;

  // 1. Thử lấy giá thật và tên từ API Shopee nếu có itemId & shopId
  if (itemId && shopId) {
    try {
      const priceInfo = await fetchCurrentPrice(itemId, shopId, resolvedUrl);
      currentPrice = priceInfo.price;
      productName = priceInfo.productName;
    } catch {
      // Shopee chặn IP cloud -> fallback bóc tách từ link
    }
  } else if (/tiktok/.test(resolvedUrl)) {
    try {
      const tiktokInfo = await tiktokPriceService.fetchCurrentPrice(resolvedUrl);
      currentPrice = tiktokInfo.price;
      productName = tiktokInfo.productName;
    } catch {}
  }

  // 2. Thử bóc tách giá từ URL (ví dụ link Lazada có displayPrice)
  if (!currentPrice) {
    currentPrice = extractPriceFromUrl(resolvedUrl);
  }

  // 3. Fallback bóc tách tên sản phẩm từ URL slug thật
  if (!productName) {
    productName = extractProductNameFromUrl(resolvedUrl) || "Sản phẩm theo dõi";
  }

  return {
    productName,
    currentPrice,
    price: currentPrice,
    resolvedUrl,
    variants: [
      "Mặc định (Tất cả phân loại)",
      "Màu Đen",
      "Màu Trắng",
      "Size M",
      "Size L",
    ],
  };
}

module.exports = {
  getMaxSlots,
  createTrackingItem,
  listTrackingItems,
  deleteTrackingItem,
  getTrackingItemHistory,
  previewTrackingItem,
};
