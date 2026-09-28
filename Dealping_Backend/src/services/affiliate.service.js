const axios = require("axios");
const crypto = require("crypto");

/**
 * Tạo link Affiliate Shopee
 * @param {string} originalUrl Link Shopee gốc
 * @returns {string} Link Affiliate Shopee
 */
function generateShopeeAffiliate(originalUrl) {
  const shopeeAffiliateId = process.env.SHOPEE_AFFILIATE_ID || "an_17349520236";
  const urlObj = new URL(originalUrl);
  urlObj.searchParams.set("mmp_pid", shopeeAffiliateId);
  urlObj.searchParams.set("utm_medium", "affiliates");
  urlObj.searchParams.set("utm_source", shopeeAffiliateId);
  urlObj.searchParams.set("utm_content", "dealping");
  return urlObj.toString();
}

/**
 * Tạo link Affiliate TikTok qua AccessTrade
 * Giả sử AccessTrade cung cấp endpoint API để tạo deep link. 
 * Nếu không có API gen deep link trực tiếp, có thể dùng format URL có sẵn của AT.
 * @param {string} originalUrl Link TikTok gốc
 * @returns {Promise<string>} Link Affiliate TikTok (AccessTrade)
 */
async function generateTikTokAffiliate(originalUrl) {
  // Demo API call or URL construction for AccessTrade
  // AccessTrade thường có cấu trúc link: https://go.isclix.com/deep_link/...
  // Cần dựa vào tài liệu AccessTrade cụ thể. Tạm thời trả về link ghép params:
  const pubId = process.env.ACCESSTRADE_PUB_ID;
  const campaignId = process.env.ACCESSTRADE_TIKTOK_CAMPAIGN_ID;
  
  if (!pubId || !campaignId) return originalUrl;

  // Ví dụ structure deep link của AccessTrade (có thể thay đổi tuỳ hệ thống)
  // https://go.isclix.com/deep_link/v2/{pub_id}?url={encodedUrl}&campaign_id={campaignId}
  const baseUrl = "https://go.isclix.com/deep_link/v2";
  const deepLink = `${baseUrl}/${pubId}?url=${encodeURIComponent(originalUrl)}&campaign_id=${campaignId}`;
  
  return deepLink;
}

/**
 * Tạo link Affiliate Lazada
 * Dùng LAZADA_APP_KEY, LAZADA_APP_SECRET
 * @param {string} originalUrl Link Lazada gốc
 * @returns {Promise<string>} Link Affiliate Lazada
 */
async function generateLazadaAffiliate(originalUrl) {
  // Lazada affiliate generation usually involves their Open API or a tracking link format
  // Demo URL construction. In a real scenario, use Lazada Open Platform API
  const appKey = process.env.LAZADA_APP_KEY;
  if (!appKey) return originalUrl;
  
  // Tạm ghép URL tracking cơ bản
  const urlObj = new URL(originalUrl);
  urlObj.searchParams.set("lkid", appKey);
  return urlObj.toString();
}

module.exports = {
  generateShopeeAffiliate,
  generateTikTokAffiliate,
  generateLazadaAffiliate,
};
