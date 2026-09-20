const asyncHandler = require("../utils/asyncHandler");
const trackingItemsService = require("../services/trackingItems.service");

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

module.exports = { create, list, remove };
