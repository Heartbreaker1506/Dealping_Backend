const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const trackingItemsService = require("../services/trackingItems.service");
const { parseShopeeLink } = require("../services/linkParser.service");
const { fetchCurrentPrice } = require("../services/shopeePriceService");

const create = asyncHandler(async (req, res) => {
  const { userId, shopeeUrl, targetPrice, variantName, selectedModelId } = req.body;
  const item = await trackingItemsService.createTrackingItem({ userId, shopeeUrl, targetPrice, variantName, selectedModelId });
  res.status(201).json({ success: true, data: item });
});

const list = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const items = await trackingItemsService.listTrackingItems(userId);
  res.status(200).json({ success: true, data: items });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  await trackingItemsService.deleteTrackingItem(id, userId);
  res.status(204).send();
});

const getHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const history = await trackingItemsService.getTrackingItemHistory(id);
  res.status(200).json({ success: true, data: history });
});

const preview = asyncHandler(async (req, res) => {
  const { shopeeUrl } = req.body;
  if (!shopeeUrl) {
    throw new ApiError(400, "Thiếu shopeeUrl");
  }

  const { itemId, shopId, resolvedUrl } = await parseShopeeLink(shopeeUrl);
  const priceInfo = await fetchCurrentPrice(itemId, shopId);

  res.status(200).json({ 
    success: true, 
    data: { ...priceInfo, shopeeUrl: resolvedUrl }
  });
});

module.exports = { create, list, remove, getHistory, preview };
