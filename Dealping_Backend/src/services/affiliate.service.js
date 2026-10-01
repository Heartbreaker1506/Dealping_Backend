const axios = require("axios");
const crypto = require("crypto");

/**
 * Tạo link Affiliate Shopee
 * @param {string} originalUrl Link Shopee gốc
 * @returns {string} Link Affiliate Shopee
 */
function generateShopeeAffiliate(originalUrl) {
  const shopeeAffiliateId = process.env.SHOPEE_AFFILIATE_ID;
  if (!shopeeAffiliateId) return originalUrl;

  const urlObj = new URL(originalUrl);
  urlObj.searchParams.set("mmp_pid", shopeeAffiliateId);
  urlObj.searchParams.set("utm_medium", "affiliates");
  urlObj.searchParams.set("utm_source", shopeeAffiliateId);
  urlObj.searchParams.set("utm_content", "dealping");
  return urlObj.toString();
}

/**
 * Tạo link Affiliate TikTok qua AccessTrade
 * @param {string} originalUrl Link TikTok gốc
 * @returns {Promise<string>} Link Affiliate TikTok (AccessTrade)
 */
async function generateTikTokAffiliate(originalUrl) {
  const pubId = process.env.ACCESSTRADE_PUB_ID;
  const campaignId = process.env.ACCESSTRADE_TIKTOK_CAMPAIGN_ID;
  
  if (!pubId || !campaignId) return originalUrl;

  const baseUrl = "https://go.isclix.com/deep_link";
  const deepLink = `${baseUrl}/${pubId}?url=${encodeURIComponent(originalUrl)}`;
  
  return deepLink;
}

/**
 * Tạo link Affiliate Lazada
 * @param {string} originalUrl Link Lazada gốc
 * @returns {Promise<string>} Link Affiliate Lazada
 */
async function generateLazadaAffiliate(originalUrl) {
  const appKey = process.env.LAZADA_APP_KEY;
  if (!appKey) return originalUrl;
  
  const urlObj = new URL(originalUrl);
  urlObj.searchParams.set("lkid", appKey);
  return urlObj.toString();
}

module.exports = {
  generateShopeeAffiliate,
  generateTikTokAffiliate,
  generateLazadaAffiliate,
};
