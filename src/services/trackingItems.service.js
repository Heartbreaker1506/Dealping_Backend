const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { parseProductLink, extractProductNameFromUrl, extractPriceFromUrl } = require("./linkParser.service");
const shopeePriceService = require("./shopeePriceService");
const tiktokPriceService = require("./tiktokPriceService");
const lazadaPriceService = require("./lazadaPriceService");
const affiliateService = require("./affiliate.service");

/**
 * unlockedSlot2 = false -> tối đa 1 item
 * unlockedSlot2 = true  -> tối đa 2 item (hard cap theo yêu cầu)
 */
function getMaxSlots(user) {
  return user.unlockedSlot2 ? 2 : 1;
}

async function createTrackingItem({
  userId,
  shopeeUrl, // frontend vẫn gửi shopeeUrl hoặc productUrl
  productUrl,
  targetPrice,
  variantName,
  selectedModelId,
  productName: inputProductName,
  originalPrice: inputOriginalPrice,
}) {
  const finalUrl = shopeeUrl || productUrl;
  if (!userId || !finalUrl || targetPrice === undefined) {
    throw new ApiError(400, "Thiếu userId, productUrl hoặc targetPrice");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "Không tìm thấy user");
  }

  const currentCount = await prisma.trackingItem.count({ where: { userId } });
  const maxSlots = getMaxSlots(user);

  if (currentCount >= maxSlots) {
    throw new ApiError(
      400,
      `Bạn đã đạt giới hạn ${maxSlots} sản phẩm theo dõi. Vui lòng xoá bớt hoặc mở khoá thêm slot.`
    );
  }

  const { platform, itemId, shopId, resolvedUrl } = await parseProductLink(finalUrl);

  const existingWhere = itemId
    ? { userId, itemId: BigInt(itemId) }
    : { userId, productUrl: resolvedUrl };

  const existing = await prisma.trackingItem.findFirst({
    where: existingWhere,
  });
  
  if (existing) {
    throw new ApiError(400, "Bạn đã theo dõi sản phẩm này rồi");
  }

  let currentPrice = inputOriginalPrice || null;
  let productName = inputProductName?.trim() || null;
  let affiliateUrl = null;

  try {
    if (platform === "SHOPEE") {
      const priceInfo = await shopeePriceService.fetchCurrentPrice(itemId, shopId, resolvedUrl);
      if (!currentPrice && priceInfo.price > 0) currentPrice = priceInfo.price;
      if (!productName) productName = priceInfo.productName;
      affiliateUrl = affiliateService.generateShopeeAffiliate(resolvedUrl);
    } else if (platform === "TIKTOK") {
      const priceInfo = await tiktokPriceService.fetchCurrentPrice(resolvedUrl);
      if (!currentPrice && priceInfo.price > 0) currentPrice = priceInfo.price;
      if (!productName) productName = priceInfo.productName;
      affiliateUrl = await affiliateService.generateTikTokAffiliate(resolvedUrl);
    } else if (platform === "LAZADA") {
      const priceInfo = await lazadaPriceService.fetchCurrentPrice(resolvedUrl);
      if (!currentPrice && priceInfo.price > 0) currentPrice = priceInfo.price;
      if (!productName) productName = priceInfo.productName;
      affiliateUrl = await affiliateService.generateLazadaAffiliate(resolvedUrl);
    }
  } catch (err) {
    console.error("Error fetching price in create:", err.message);
  }

  if (!currentPrice) {
    currentPrice = extractPriceFromUrl(resolvedUrl);
  }

  if (!productName || productName === "Không thể lấy tên sản phẩm") {
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
      productUrl: resolvedUrl,
      platform: platform || "SHOPEE",
      affiliateUrl: affiliateUrl,
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

async function previewTrackingItem(urlParams) {
  // urlParams có thể là shopeeUrl do FE gửi lên
  const finalUrl = urlParams;
  if (!finalUrl) throw new ApiError(400, "Thiếu đường dẫn sản phẩm");
  
  const { platform, itemId, shopId, resolvedUrl } = await parseProductLink(finalUrl);
  
  let productName = null;
  let currentPrice = null;

  try {
    if (platform === "SHOPEE") {
      const priceInfo = await shopeePriceService.fetchCurrentPrice(itemId, shopId, resolvedUrl);
      currentPrice = priceInfo.price;
      productName = priceInfo.productName;
    } else if (platform === "TIKTOK") {
      const priceInfo = await tiktokPriceService.fetchCurrentPrice(resolvedUrl);
      currentPrice = priceInfo.price;
      productName = priceInfo.productName;
    } else if (platform === "LAZADA") {
      const priceInfo = await lazadaPriceService.fetchCurrentPrice(resolvedUrl);
      currentPrice = priceInfo.price;
      productName = priceInfo.productName;
    }
  } catch (err) {
    console.error("Preview error:", err.message);
  }

  if (!currentPrice) {
    currentPrice = extractPriceFromUrl(resolvedUrl);
  }

  if (!productName || productName === "Không thể lấy tên sản phẩm") {
    productName = extractProductNameFromUrl(resolvedUrl) || "Sản phẩm theo dõi";
  }

  return {
    productName,
    currentPrice,
    price: currentPrice,
    resolvedUrl,
    platform,
    variants: [
      "Mặc định (Tất cả phân loại)"
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
